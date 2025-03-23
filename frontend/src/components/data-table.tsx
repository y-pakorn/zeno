"use client"

import { ComponentProps, memo, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  Row,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"

import { ScrollArea } from "./ui/scroll-area"
import { Skeleton } from "./ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

export const DataTable = memo(function DataTable<TData, TValue>({
  data,
  columns,
  transparent = false,
  options,
  rowClassName,
  rowProps,
  className,
  isLoadingSkeleton = false,
  ...props
}: ComponentProps<"div"> & {
  columns: any
  data: TData[]
  transparent?: boolean
  rowClassName?: (row: Row<TData>) => string
  rowProps?: (row: Row<TData>) => React.ComponentProps<"tr">
  options?: Partial<Omit<TableOptions<TData>, "data" | "columns">>
  isLoadingSkeleton?: boolean
}) {
  const { data: finalData, columns: finalColumns } = useMemo(() => {
    return isLoadingSkeleton
      ? {
          data: Array.from({ length: 10 }, () => ({})),
          columns: columns.map((column: any) => ({
            ...column,
            cell: () => <Skeleton className="h-4 w-full" />,
          })),
        }
      : { data, columns }
  }, [columns, data, isLoadingSkeleton])
  const table = useReactTable({
    data: finalData as TData[],
    columns: finalColumns,
    ...options,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div
      className={cn(
        "rounded-2xl border",
        "max-h-full min-h-0 overflow-y-auto",
        "scrollbar-thumb-accent scrollbar-track-transparent scrollbar",
        className
      )}
      {...props}
    >
      <Table>
        <TableHeader className="bg-background sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-quaternary font-semibold first:rounded-tl-md last:rounded-tr-md",
                      !transparent && "bg-secondary"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                {...rowProps?.(row)}
                className={cn(rowClassName?.(row))}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
})
