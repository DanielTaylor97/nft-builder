'use client';

import React from "react";
import { ExplorerLink } from "../cluster/cluster-ui";
import { ellipsify } from "../ui/ui-layout";

export const TableComponent = ({
    collection,
    items,
    showAll,
    setShowAll
}): React.JSX.Element => {
    return (
        <div>
        {collection.isError && <pre className="alert alert-error">Error: {collection.error?.message.toString()}</pre>}
        {collection.isSuccess && (
            <div>
                {collection.data.length === 0 ? (
                    <div>No matches found.</div>
                ) : (
                    <table className="table border-4 rounded-lg border-separate border-base-300">
                    <thead>
                        <tr>
                        <th>Mint</th>
                        <th>Token</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Metadata</th>
                        <th>Hash</th>
                        <th>Timestamp</th>
                        <th>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items?.map((item) => (
                        <tr key={item.mint.toString()}>
                            <th className="font-mono">
                                <ExplorerLink path={`account/${item.mint.toString()}`} label={ellipsify(item.mint.toString(), 3)} />
                            </th>
                            <td className="font-mono text-right">
                                <ExplorerLink path={`tx/${item.creationTx}`} label={ellipsify(item.creationTx, 3)} />
                            </td>
                            <td>{item.name}</td>
                            <td className="font-mono text-right">
                                {
                                    item.location ? <a
                                    href={item.location}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`link font-mono`}
                                    >
                                        {ellipsify(item.location, 4)}
                                    </a> : "NULL"
                                }
                            </td>
                            <td className="font-mono text-right">
                                {
                                    item.metadataLoc ? <a
                                    href={item.metadataLoc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`link font-mono`}
                                    >
                                        {ellipsify(item.metadataLoc, 4)}
                                    </a> :
                                    "NULL"
                                }
                            </td>
                            <td title={item.hash}>
                                {
                                    item.hash ? ellipsify(item.hash, 8) : "NULL"
                                }
                            </td>
                            <td>{new Date((item.timestamp) * 1000).toISOString()}</td>
                            <td>
                                {
                                    item.size ? `${item.size / 1000.0}kB` : "NULL"
                                }
                            </td>
                            <td className="text-right">
                                {item.complete ? (
                                    <div className="badge badge-success">
                                        Success
                                    </div>
                                ) : (
                                    <div className="badge badge-error">
                                        Incomplete
                                    </div>
                                )}
                            </td>
                        </tr>
                        ))}
                        {(collection.data?.length ?? 0) > 5 && (
                        <tr>
                            <td colSpan={4} className="text-center">
                            <button className="btn btn-xs btn-outline" onClick={() => setShowAll(!showAll)}>
                                {showAll ? 'Show Less' : 'Show All'}
                            </button>
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                )}
            </div>
        )}
        </div>
    )
}