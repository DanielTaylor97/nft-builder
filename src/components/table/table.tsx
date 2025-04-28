'use client';

import React from "react";
import { Tabulate } from "./tabulate";
import { UseQueryResult } from "@tanstack/react-query";
import { StoredResult } from "../../app/api/collection/results";

export const TableComponent = (
    { collection, items, showAll, setShowAll }:
    { collection: UseQueryResult<StoredResult[], Error>, items: StoredResult[], showAll, setShowAll }
    ): React.JSX.Element => {
    return (
        <div>
        {collection.isError && <pre className="alert alert-error">Error: {collection.error?.message.toString()}</pre>}
        {collection.isSuccess && (
            <div>
                {collection.data.length === 0 ? (
                    <div>No matches found.</div>
                ) : (
                    <Tabulate items={items} collection={collection} showAll={showAll} setShowAll={setShowAll} />
                )}
            </div>
        )}
        </div>
    )
}