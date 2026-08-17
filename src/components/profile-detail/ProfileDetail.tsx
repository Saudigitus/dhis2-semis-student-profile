import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    ButtonStrip,
    Card,
    CircularLoader,
    Label,
    Menu,
    Popover,
    Tag,
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
import { D2I18n } from 'dhis2-semis-types';
import { useFileResource } from 'dhis2-semis-functions';
import type { ResolvedProfileFields, ResolvedBadge } from '../../hooks/profile/useGetProfile';
import styles from './ProfileDetail.module.css';
import useGetSelectedKeys from '../../../../../libs/components/src/hooks/config/useGetSelectedKeys';
import ModalManager from '../modal/assignFinalDecision/ModalManager';
import Loader from '../loader/Loader';

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
};

function BadgeTag({ badge, i18n }: { badge: ResolvedBadge; i18n: D2I18n }) {
    const displayValue = badge.value ?? i18n.t('Not recorded');
    const isPositive = badge.source === 'FINAL_RESULT_STATUS' ? badge.value : true;



    return (
        <Tag
            neutral={false}
            positive={isPositive}
            negative={!isPositive}
        >
            {displayValue}
        </Tag>
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
    } = props;

    const { program: programData, dataStoreData } = useGetSelectedKeys()
    const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
    const moreMenuRef = React.useRef<HTMLDivElement | null>(null);
    const [photoSrc, setPhotoSrc] = useState<string | null>(null);
    const [photoLoading, setPhotoLoading] = useState<boolean>(false);
    const { getFileResource } = useFileResource();
    const [openFinalDecisionModal, setOpenFinalDecisionModal] = useState<boolean>(false);
    const [finalDecision, setFinalDecision] = useState<object | null>(null);

    const title = fields?.title ?? i18n.t('Student Profile');
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

    const finalDecisionOptions = programData?.programStages?.find((stage) => stage?.id == dataStoreData?.['final-result']?.programStage)
        ?.programStageDataElements?.find((dataElement) => dataElement?.dataElement?.id == dataStoreData?.['final-result']
            ?.status)?.dataElement?.optionSet?.options


    const onAssignFinalDecision = (decision: object) => {
        setOpenFinalDecisionModal(true);
        setFinalDecision(decision);
    }

    return (
        <Card className={styles.profileCard}>
            <div className={styles.profileHeader}>
                <div className={styles.profileInfo}>
                    <div className={styles.avatarContainer}>
                        {photoLoading ? (
                            <CircularLoader small />
                        ) : photoSrc ? (
                            <img src={photoSrc} alt={title} className={styles.photo} />
                        ) : (
                            <IconUser sx={{ color: '#1E6194', fontSize: 28 }} />
                        )}
                    </div>
                    {
                        loading ?
                            <Loader />
                            :
                            <div className={styles.studentDetails}>
                                <h2 className={styles.studentName}>{title}</h2>
                                <Label className={styles.studentId}>{subtitle}</Label>
                                <div className={styles.tagsContainer}>
                                    {badges.map((badge) => (
                                        <BadgeTag key={badge.order} badge={badge} i18n={i18n} />
                                    ))}
                                </div>
                            </div>
                    }
                </div>

                <ButtonStrip>
                    {/* <Button small primary disabled={loading} onClick={onEdit} icon={<IconEdit sx={{ fontSize: 15 }} />}>
                        {i18n.t('Edit')}
                    </Button> */}
                    <div ref={moreMenuRef}>
                        <Button
                            small
                            secondary
                            disabled={loading}
                            icon={<IconMore />}
                            onClick={() => setMoreMenuOpen((open) => !open)}
                            aria-label="More actions"
                        />
                    </div>
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
                                            Mark student as {option?.label}
                                        </MenuItem>
                                    ))
                                }
                            </Menu>
                        </Popover>
                    )}
                </ButtonStrip>
            </div>
            {openFinalDecisionModal && (
                <ModalManager
                    i18n={i18n}
                    saveMode="UPDATE"
                    finalDecision={finalDecision}
                    open={openFinalDecisionModal}
                    setOpen={setOpenFinalDecisionModal}
                />
            )}
        </Card>
    );
}
