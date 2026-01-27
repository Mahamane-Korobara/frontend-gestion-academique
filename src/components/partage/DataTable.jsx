'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Pagination from './Pagination';
import { useState, useMemo } from 'react';

/**
 * DataTable - Composant réutilisable pour afficher des données tabulaires
 * 
 * @param {Array} data - Les données à afficher
 * @param {Array} columns - Définition des colonnes [{key, label, render}]
 * @param {string} title - Titre du tableau
 * @param {string} description - Description du tableau
 * @param {number} itemsPerPage - Nombre d'items par page (défaut: 10)
 * @param {boolean} responsive - Mode responsive (défaut: true)
 */
export default function DataTable({
  data = [],
  columns = [],
  title,
  description,
  itemsPerPage = 10,
  responsive = true,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 si les données changent
  useMemo(() => {
    setCurrentPage(1);
  }, [data]);

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Table */}
        <div className={responsive ? 'overflow-x-auto' : ''}>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <TableRow key={row.id || idx}>
                    {columns.map((col) => (
                      <TableCell key={`${row.id || idx}-${col.key}`} className={col.cellClassName}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                    Aucune donnée à afficher
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data.length > itemsPerPage && (
          <div className="px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={data.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
