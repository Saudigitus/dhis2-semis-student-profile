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
    console.log(badge, "badge")
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

    const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
    const moreMenuRef = React.useRef<HTMLDivElement | null>(null);
    const [photoSrc, setPhotoSrc] = useState<string | null>(null);
    const [photoLoading, setPhotoLoading] = useState<boolean>(false);
    const { getFileResource } = useFileResource();

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

    if (loading) {
        return (
            <Box width="100%" height="120px" display="flex" alignItems="center" justifyContent="center">
                <CircularLoader />
            </Box>
        );
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
                    <div className={styles.studentDetails}>
                        <h2 className={styles.studentName}>{title}</h2>
                        <Label className={styles.studentId}>{subtitle}</Label>
                        <div className={styles.tagsContainer}>
                            {badges.map((badge) => (
                                <BadgeTag key={badge.order} badge={badge} i18n={i18n} />
                            ))}
                        </div>
                    </div>
                </div>

                <ButtonStrip>
                    <Button small primary onClick={onEdit} icon={<IconEdit sx={{ fontSize: 15 }} />}>
                        {i18n.t('Edit')}
                    </Button>
                    <div ref={moreMenuRef}>
                        <Button
                            small
                            secondary
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
                                <MenuItem
                                    onClick={() => {
                                        onPrintProfile?.();
                                        setMoreMenuOpen(false);
                                    }}
                                    icon={<Print />}
                                >
                                    {i18n.t('Print profile')}
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        onExportRecord?.();
                                        setMoreMenuOpen(false);
                                    }}
                                    icon={<IconExport />}
                                >
                                    {i18n.t('Export record')}
                                </MenuItem>
                                <MenuItem
                                    danger
                                    onClick={() => {
                                        onMarkAsDropout?.();
                                        setMoreMenuOpen(false);
                                    }}
                                    icon={<IconDropout />}
                                >
                                    {i18n.t('Mark as Dropout')}
                                </MenuItem>
                                <MenuItem
                                    danger
                                    onClick={() => {
                                        onDeleteRecord?.();
                                        setMoreMenuOpen(false);
                                    }}
                                    icon={<IconDelete />}
                                >
                                    {i18n.t('Delete record')}
                                </MenuItem>
                            </Menu>
                        </Popover>
                    )}
                </ButtonStrip>
            </div>
        </Card>
    );
}
