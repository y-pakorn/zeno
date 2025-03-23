"use client"

import { ComponentProps, memo } from "react"
import {
  flexRender,
  getCoreRowModel,
  Row,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"

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
  ...props
}: ComponentProps<"div"> & {
  columns: any
  data: TData[]
  transparent?: boolean
  rowClassName?: (row: Row<TData>) => string
  rowProps?: (row: Row<TData>) => React.ComponentProps<"tr">
  options?: Partial<Omit<TableOptions<TData>, "data" | "columns">>
}) {
  const table = useReactTable({
    data,
    columns,
    ...options,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={cn("rounded-2xl border", className)} {...props}>
      <Table>
        <TableHeader>
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
                className={rowClassName?.(row)}
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
