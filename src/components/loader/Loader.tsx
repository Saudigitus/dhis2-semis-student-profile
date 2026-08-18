import { FunctionComponent } from "react";


const Loader: FunctionComponent = () => {
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
            Loading...
        </div >
    );
}

export default Loader;