import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    ButtonStrip,
    Card,
    CircularLoader,
    IconEdit24,
    IconLock24,
    Label,
    Menu,
    Popover,
    Tag,
    Tooltip,
} from '@dhis2/ui';
import {
    EditDocument as IconEdit,
    MoreVert as IconMore,
    Delete as IconDelete,
    Person as IconUser,
    Print,
    FileDownload as IconExport,
    Block as IconDropout,
} from "@mui/icons-material";
import { D2I18n, ProgramConfig } from 'dhis2-semis-types';
import { getOptionStyle, useFileResource, useSaveTei } from 'dhis2-semis-functions';
import type { ResolvedProfileFields, ResolvedBadge } from '../../hooks/profile/useGetProfile';
import styles from './ProfileDetail.module.css';
import useGetSelectedKeys from '../../../../../libs/components/src/hooks/config/useGetSelectedKeys';
import ModalManager from '../modal/assignFinalDecision/ModalManager';
import Loader from '../loader/Loader';
import { getDisplayName } from 'dhis2-semis-components';
import { useDataEngine } from '@dhis2/app-runtime';
import { profileDetails } from '../../schema/profile/profile-details';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getAttributes } from '../../utils/profile/getAttributes';
import RefetchSchemaAtom from '../../schema/refetchSchema';

const POSTFILERESOURCEMUTATION: any = {
    resource: "fileResources",
    data: ({ data }: any) => data,
    type: "create"
}

type ProfileDetailProps = {
    i18n: D2I18n;
    loading?: boolean;
    fields?: Partial<ResolvedProfileFields>;
    trackedEntity?: string;
    program?: string;
    onEdit?: () => void;
    onPrintProfile?: () => void;
    onExportRecord?: () => void;
    onMarkAsDropout?: () => void;
    onDeleteRecord?: () => void;
    hasEnrollment?: boolean;
};

// Same colour for the same person everywhere, when there is no photo.
const AVATAR_COLOURS = ['#2c6693', '#7b4f9d', '#1f7a8c', '#a3542a', '#3d7a3a', '#9c3b5a'];
const avatarColour = (id = '') => AVATAR_COLOURS[id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_COLOURS.length];
const initialsOf = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0].toUpperCase()).join('');

function BadgeTag({ badge, i18n, program }: { badge: ResolvedBadge; i18n: D2I18n, program: ProgramConfig }) {
    const displayValue = badge.value ?? i18n.t('Not recorded');
    const isPositive = badge.source === 'FINAL_RESULT_STATUS' ? badge.value : true;

    return (
        <div
            style={{
                color: '#fff',
                backgroundColor: getOptionStyle({ metaData: badge?.attributeId!, program: program as any, value: displayValue })?.color || "#bbbbbb"
            }}
            className={styles.badge}
        >
            {getDisplayName({ metaData: badge?.attributeId!, program, value: displayValue })}
        </div>
    );
}

function MenuItem({
    children,
    onClick,
    danger = false,
    icon,
}: {
    children: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    icon?: React.ReactNode;
}) {
    return (
        <div
            role="menuitem"
            onClick={onClick}
            className={danger ? styles.menuItemDanger : styles.menuItem}
        >
            {icon}
            {children}
        </div>
    );
}

export default function ProfileDetail(props: ProfileDetailProps) {
    const {
        i18n,
        loading = false,
        fields,
        trackedEntity,
        program,
        onEdit,
        onPrintProfile,
        onExportRecord,
        onMarkAsDropout,
        onDeleteRecord,
        hasEnrollment = false,
    } = props;

    const { program: programData, dataStoreData } = useGetSelectedKeys()
    const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
    const moreMenuRef = React.useRef<HTMLDivElement | null>(null);
    const engine = useDataEngine()
    const [photoSrc, setPhotoSrc] = useState<string | null>(null);
    const [photoLoading, setPhotoLoading] = useState<boolean>(false);
    const { getFileResource } = useFileResource();
    const [openFinalDecisionModal, setOpenFinalDecisionModal] = useState<boolean>(false);
    const [finalDecision, setFinalDecision] = useState<object | null>(null);
    const fileInputRef = useRef(null);
    const [refetch, setRefetch] = useRecoilState(RefetchSchemaAtom);
    const [loader, setLoader] = useState(false);
    const { saveTei, loading: saving } = useSaveTei();
    const profileDetailsState = useRecoilValue(profileDetails);

    const canUploadImage = fields?.photoAttributeId

    const title = fields?.title || i18n.t('No name');
    const subtitle = fields?.subtitle ?? '—';
    const photoAttribute = fields?.photoAttributeId;
    const badges = fields?.badges ?? [];


    useEffect(() => {
        if (!trackedEntity || !photoAttribute || !program) return;

        setPhotoLoading(true);
        getFileResource({ trackedEntity, attribute: photoAttribute, program })
            .then(({ file }) => {
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setPhotoSrc(reader.result as string);
                        setPhotoLoading(false);
                    };
                    reader.readAsDataURL(file);
                } else {
                    setPhotoLoading(false);
                }
            })
            .catch(() => setPhotoLoading(false));
    }, [trackedEntity, photoAttribute, program]);

    // "Mark as..." only for a year with an enrollment; there are no options when the final result is not set up.
    const finalDecisionOptions = !hasEnrollment || (dataStoreData as any)?.['final-result']?.enabled === false ? [] : programData?.programStages?.find((stage) => stage?.id == dataStoreData?.['final-result']?.programStage)
        ?.programStageDataElements?.find((dataElement) => dataElement?.dataElement?.id == dataStoreData?.['final-result']
            ?.status)?.dataElement?.optionSet?.options


    const onAssignFinalDecision = (decision: object) => {
        setOpenFinalDecisionModal(true);
        setFinalDecision(decision);
    }

    const handleImageClick = () => {
        if (!canUploadImage) return

        fileInputRef.current?.click()
    }

    const handleImageChange = async (event: any) => {
        setLoader(true)
        const file = event.target.files?.[0]
        if (!file) return

        const postFile = await engine.mutate(POSTFILERESOURCEMUTATION, { variables: { data: { file: file } } }) as unknown as any

        const fileId = postFile.response.fileResource.id

        await saveTei({
            data: getAttributes(profileDetailsState, fileId, canUploadImage!),
            messages: {
                error: `${i18n.t("Could not conclude the operation.")}`,
                sucess: `${i18n.t("Profile updated successfully")}`,
            },
            handleComplete: () => {
                window.location.reload()
                setLoader(false)
            },
        });
    }

    return (
        <Card className={styles.profileCard}>
            <div className={styles.profileHeader}>
                <div className={styles.profileInfo}>
                    <div
                        className={`${styles.avatarContainer} ${canUploadImage ? styles.editable : styles.disabled
                            }`}
                        onClick={canUploadImage ? handleImageClick : undefined}
                    >
                        {photoLoading || loader ? (
                            <CircularLoader small />
                        ) : photoSrc ? (
                            <img
                                src={photoSrc}
                                alt={title}
                                className={styles.photo}
                            />
                        ) : fields?.title ? (
                            <span
                                className={styles.photo}
                                style={{ backgroundColor: avatarColour(trackedEntity), color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}
                            >
                                {initialsOf(fields.title)}
                            </span>
                        ) : (
                            <IconUser
                                sx={{ color: '#1E6194', fontSize: 28 }}
                            />
                        )}

                        {canUploadImage ? (
                            <div className={styles.editOverlay}>
                                <IconEdit24 />
                            </div>
                        ) : (
                            <Tooltip content={i18n.t("You can't upload/change a photo")}>
                                <div className={styles.disabledIndicator}>
                                    <IconLock24 />
                                </div>
                            </Tooltip>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    {
                        loading ?
                            <Loader i18n={i18n} />
                            :
                            <div className={styles.studentDetails}>
                                <h2 className={styles.studentName}>{title}</h2>
                                <Label className={styles.studentId}>{subtitle}</Label>
                                <div className={styles.tagsContainer}>
                                    {badges.map((badge) => (
                                        <BadgeTag key={badge.order} badge={badge} i18n={i18n} program={programData!} metaData={badge?.variable} />
                                    ))}
                                </div>
                            </div>
                    }
                </div>

                <ButtonStrip>
                    <Button small primary disabled={loading} onClick={onEdit} icon={<IconEdit sx={{ fontSize: 15 }} />}>
                        {i18n.t('Edit')}
                    </Button>
                    {!!finalDecisionOptions?.length && <div ref={moreMenuRef}>
                        <Button
                            small
                            secondary
                            disabled={loading}
                            icon={<IconMore />}
                            onClick={() => setMoreMenuOpen((open) => !open)}
                            aria-label={i18n.t('More actions')}
                        />
                    </div>}
                    {moreMenuOpen && (
                        <Popover
                            reference={moreMenuRef}
                            onClickOutside={() => setMoreMenuOpen(false)}
                            placement="bottom-end"
                        >
                            <Menu dense>
                                {
                                    finalDecisionOptions?.map((option) => (
                                        <MenuItem
                                            key={option?.value}
                                            onClick={() => onAssignFinalDecision(option)}
                                        >
                                            <span style={{ color: option?.style?.color }}>
                                                {i18n.t('Mark student as {{decision}}', { decision: option?.label })}
                                            </span>
                                        </MenuItem>
                                    ))
                                }
                            </Menu>
                        </Popover>
                    )}
                </ButtonStrip>
            </div>
            {
                openFinalDecisionModal && (
                    <ModalManager
                        i18n={i18n}
                        saveMode="UPDATE"
                        finalDecision={finalDecision}
                        open={openFinalDecisionModal}
                        setOpen={setOpenFinalDecisionModal}
                    />
                )
            }
        </Card >
    );
}
