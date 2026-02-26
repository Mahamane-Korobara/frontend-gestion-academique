import { notesAdminAPI } from '@/lib/api/endpoints';

const notesAdminService = {
    getEnAttente: (params) => notesAdminAPI.getEnAttente(params),
    valider: (noteId) => notesAdminAPI.valider(noteId),
    validerMasse: (noteIds) => notesAdminAPI.validerMasse({ note_ids: noteIds }),
};

export default notesAdminService;
