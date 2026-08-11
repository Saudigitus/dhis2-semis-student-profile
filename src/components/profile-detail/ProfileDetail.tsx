import React, { useState } from 'react';
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
import type { ResolvedProfileFields } from '../../hooks/profile/useGetProfile';
import styles from './ProfileDetail.module.css';

type ProfileDetailProps = {
    i18n: D2I18n;
    loading?: boolean;
    fields?: Partial<ResolvedProfileFields>;
    onEdit?: () => void;
    onPrintProfile?: () => void;
    onExportRecord?: () => void;
    onMarkAsDropout?: () => void;
    onDeleteRecord?: () => void;
};

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
        onEdit,
        onPrintProfile,
        onExportRecord,
        onMarkAsDropout,
        onDeleteRecord,
    } = props;

    const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
    const moreMenuRef = React.useRef<HTMLDivElement | null>(null);

    const fullName = fields?.fullName ?? i18n.t('Student Profile');
    const systemId = fields?.systemId ?? '—';
    const gender = fields?.gender ?? i18n.t('Not recorded');

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
                        <IconUser sx={{ color: '#1E6194', fontSize: 28 }} />
                    </div>
                    <div className={styles.studentDetails}>
                        <h2 className={styles.studentName}>{fullName}</h2>
                        <Label className={styles.studentId}>{systemId}</Label>
                        <div className={styles.tagsContainer}>
                            <Tag neutral={false} positive={true}>
                                ✔ {i18n.t('Enrolled')}
                            </Tag>
                            <Tag
                                neutral={false}
                                accent="teal"
                                positive={false}
                                negative={false}
                            >
                                {gender}
                            </Tag>
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
