import { notesAdminAPI } from '@/lib/api/endpoints';

const notesAdminService = {
    getSoumises: (params) => notesAdminAPI.getSoumises(params),
    reouvrirMasse: (noteIds) => notesAdminAPI.reouvrirMasse({ note_ids: noteIds }),
    exportStatus: (params) => notesAdminAPI.exportStatus(params),
    exportExcel: (payload) => notesAdminAPI.exportExcel(payload),
};

export default notesAdminService;
