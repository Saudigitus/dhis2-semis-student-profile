import { atom } from 'recoil';

const RefetchSchemaAtom = atom<boolean>({
    default: false,
    key: 'refetchSchemaAtom',
})

export default RefetchSchemaAtom;