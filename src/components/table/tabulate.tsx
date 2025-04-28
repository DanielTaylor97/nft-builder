import { useMemo, useState } from "react"
import { ExplorerLink } from "../cluster/cluster-ui"
import { ellipsify } from "../ui/ui-layout"
import { createThumbnailFromUrl } from "../img/file"
import Image from "next/image"
import { StoredResult } from "../../app/api/collection/results"
import { UseQueryResult } from "@tanstack/react-query"


export const Tabulate = (
    { items, collection, showAll, setShowAll }:
    { items: Promise<{type: string;info: StoredResult;} | null>[], collection: UseQueryResult<StoredResult[], Error>, showAll, setShowAll }
): React.JSX.Element => {
    return (
        <table className="table border-4 rounded-lg border-separate border-base-300">
            <tbody>
                {items.map(async (item) => (
                    <tr key={(await item).info.mint.toString()}>
                        <ThumbnailPanel item={item} />
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
    )
}

const ThumbnailPanel = async (
    {item}:
    {
        item: Promise<{
            type: string;
            info: StoredResult;
        }>
    }
) => {
    const itm = await item;
    const img = await createThumbnailFromUrl(itm.info.location, itm.type);
    const arr = img.toString('base64');
    // btoa(String.fromCharCode(...new Uint8Array(img)))

    return (
        <div>
            <Image src={`data:image/png;base64,${arr}`} width={200} height={300} alt=""/>
            <td title={itm.info.mint.toString()}>{itm.info.name}</td>
        </div>
    );
}

const InfoPanel = (item) => {
    return (
        <tr>
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
    )
}
