'use client';

import { useCallback, useState } from 'react'

import { ExplorerLink } from '../cluster/cluster-ui'
import { ellipsify } from '../ui/ui-layout'
import { useSearchFiles } from './search-data-access'
import { FileDropSearch } from '../filedrop/file-drop'
import { StoredResult } from '../../app/api/collection/results';

export enum SubType {
    Text,
    File
}

export function FileSearcher(): JSX.Element {

    const EMPTY_FILES: File[] = [];
    // const EMPTY_RESULT = useSearch({hash: ""});
    
    const [files, setFiles] = useState<File[]>(EMPTY_FILES);
    const [showAll, setShowAll] = useState<boolean>(true);
    const [collection, setCollection] = useState<StoredResult[]>();
    const [searchError, setSearchError] = useState<Error>(null);
    const [hashText, setHashText] = useState<string>(null);
    const [submitType, setSubmitType] = useState<SubType>(SubType.Text)

    const clearFiles = useCallback(
      () => setFiles(EMPTY_FILES),
      []
    );

    const { handleFileSearch, handleHashSearch } = useSearchFiles({ setCollection, setSearchError });
    
    return (
        <div>
            <h2 className="text-2xl font-bold">Search by File or Hash</h2>
            <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={() => {
                    if(submitType === SubType.Text){
                        handleHashSearch(hashText);
                    } else {
                        handleFileSearch(files[0]);
                    }
                }}
                disabled={(!files || files.length !== 1) && (hashText === "" || hashText === null)}
            >
                Search
            </button>
            <div>
                <input onChange={(e) => {
                    setHashText(e.target.value);
                    setSubmitType(SubType.Text);
                    clearFiles();
                }} />
                <FileDropSearch onFilesSelected={setFiles} submitFile={setSubmitType} clearText={setHashText} onFilesClear={clearFiles} width="300px" height="1200px" />
            </div>
            {searchError && <pre className="alert alert-error">Error: {searchError?.message.toString()}</pre>}
            {collection && (
                <div>
                    {collection?.length === 0 ? (
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
                            {collection?.map((item) => (
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
                            {(collection?.length ?? 0) > 5 && (
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
    );
}

/*
export function UserSearcher(
    { user }:
    { user: PublicKey }
): JSX.Element {

    const collection = useGetMetadata({ user });
    const [showAll, setShowAll] = useState(false);

    const items = useMemo(() => {
        if (showAll) return collection.data
        return collection.data?.slice(0, 5)
    }, [collection.data, showAll])
    
    return (
        <div>
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Authensus History</h2>
                <div className="space-x-2">
                {collection.isLoading ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <button className="btn btn-sm btn-outline" onClick={() => collection.refetch()}>
                    <IconRefresh size={16} />
                    </button>
                )}
                </div>
            </div>
            {collection.isError && <pre className="alert alert-error">Error: {collection.error?.message.toString()}</pre>}
            {collection.isSuccess && (
                <div>
                    {collection.data.length === 0 ? (
                        <div>No transactions found.</div>
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
                                        <div className="badge badge-success">Success</div>
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
    );
}
*/
