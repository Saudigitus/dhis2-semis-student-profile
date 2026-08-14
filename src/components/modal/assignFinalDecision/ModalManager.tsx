import React from "react";
import ModalContent from "./ModalContent";
import { ModalManagerInterface } from "../../../types/modal/ModalProps";
import { ModalComponent } from "dhis2-semis-components";;

function ModalManager(props: ModalManagerInterface) {
    const { open, setOpen, i18n, finalDecision } = props;
    const handleCloseModal = () => setOpen(false);

    return (
        <ModalComponent
            open={open}
            handleClose={handleCloseModal}
            title={i18n.t('Confirm Final Decision')}
        >
            <ModalContent
                {...props}
                i18n={i18n}
                finalDecision={finalDecision}
            />
        </ModalComponent>
    );
}

export default ModalManager;
