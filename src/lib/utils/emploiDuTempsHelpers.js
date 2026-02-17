import { JOURS_ORDRE, TYPE_STYLES } from '@/lib/utils/constants';


export function getProfNom(c) {
    if (!c.professeur) return '—';
    return `${c.professeur.prenom} ${c.professeur.nom}`;
}

export function groupByJour(creneaux) {
    const map = {};
    JOURS_ORDRE.forEach(j => { map[j] = []; });
    creneaux.forEach(c => { if (map[c.jour]) map[c.jour].push(c); });
    JOURS_ORDRE.forEach(j => {
        map[j].sort((a, b) => (a.creneau?.debut || '').localeCompare(b.creneau?.debut || ''));
    });
    return map;
}

export function getStyles(color) {
    return TYPE_STYLES[color] || TYPE_STYLES.blue;
}