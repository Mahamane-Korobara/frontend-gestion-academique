'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';

export default function DashboardCharts({ charts = {} }) {
  // Préparer les données pour les graphiques
  const filieresChartData = charts.etudiants_par_filiere?.map(f => ({
    name: f.name,
    value: f.count,
  })) || [];

  const sexeChartData = Object.entries(charts.etudiants_par_sexe || {}).map(([sexe, count]) => ({
    name: sexe === 'F' ? 'Femmes' : sexe === 'M' ? 'Hommes' : sexe,
    value: count,
  }));

  const niveauChartData = (() => {
    const raw = charts.etudiants_par_niveau || {};

    if (Array.isArray(raw)) {
      const grouped = raw.reduce((acc, row) => {
        const name = row?.name || row?.nom || row?.niveau || 'N/A';
        const count = Number(row?.count ?? row?.value ?? row?.etudiants_count ?? 0);
        acc[name] = (acc[name] || 0) + count;
        return acc;
      }, {});

      return Object.entries(grouped).map(([niveau, count]) => ({
        name: niveau,
        value: count,
      }));
    }

    return Object.entries(raw).map(([niveau, count]) => ({
      name: niveau,
      value: count,
    }));
  })();

  return (
    <>
      {/* Graphiques principaux */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Répartition par Filière */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Filière</CardTitle>
            <CardDescription>Nombre d&apos;etudiants inscrits</CardDescription>
          </CardHeader>
          <CardContent>
            {filieresChartData.length > 0 ? (
              <BarChart data={filieresChartData} />
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Répartition par Sexe */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Sexe</CardTitle>
          </CardHeader>
          <CardContent>
            {sexeChartData.length > 0 ? (
              <PieChart data={sexeChartData} />
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graphiques supplémentaires */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Répartition par Niveau */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Niveau</CardTitle>
            <CardDescription>Nombre d&apos;etudiants par niveau d&apos;etude</CardDescription>
          </CardHeader>
          <CardContent>
            {niveauChartData.length > 0 ? (
              <BarChart data={niveauChartData} />
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Professeurs les plus chargés */}
        <Card>
          <CardHeader>
            <CardTitle>Professeurs les plus chargés</CardTitle>
          </CardHeader>
          <CardContent>
            {charts.professeurs_plus_charges && charts.professeurs_plus_charges.length > 0 ? (
              <div className="space-y-4">
                {charts.professeurs_plus_charges.map((prof, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{prof.nom}</p>
                      <p className="text-xs text-gray-500">{prof.cours} cours</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{prof.etudiants}</p>
                      <p className="text-xs text-gray-500">étudiants</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
