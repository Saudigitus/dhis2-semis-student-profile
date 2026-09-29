import { FunctionComponent } from "react";
import { D2I18n } from 'dhis2-semis-types';


const Loader: FunctionComponent<{ i18n: D2I18n }> = ({ i18n }) => {
    return (
        <div style={{
            padding: 24,
            fontSize: 14,
            display: 'flex',
            color: '#64748b',
            minHeight: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {i18n.t('Loading...')}
        </div >
    );
}

export default Loader;
