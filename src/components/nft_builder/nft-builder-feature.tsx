'use client';

import { NFT_BUILDER_PROGRAM_ID as programId } from "../../../anchor/src"//'@project/anchor'
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { ExplorerLink } from '../cluster/cluster-ui';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { NftBuilderMintCreate, NftBuilderProgram } from './nft-builder-ui';
import { mintTransaction } from './edit/edit-data-access';

function NftBuilderCreate() {

  const name: string = "Stand-in Name";
  const symbol: string = "STD";
  const uri: string = "https://temp-uri.json/";
  const verified: boolean = false;
  const share: number = 100;

  const newUri: string = "https://arweave-uri.json/";

  const wallet = useWallet();

  return(
    <NftBuilderMintCreate name={name} symbol={symbol} uri={uri} wallet={wallet} verified={verified} share={share} />
  )

}

export default function NftBuilderFeature() {

  const name: string = "Stand-in Name";
  const symbol: string = "STD";
  const uri: string = "https://temp-uri.json/";
  const verified: boolean = false;
  const share: number = 100;

  const wallet = useWallet();

  if (wallet.publicKey) {

    return (
      <div>
        <div>
          <AppHero
            title="NFT Builder"
            subtitle={"Add a file and Authensise it"}
          >
            {/* <p className="mb-6">
              <ExplorerLink
                path={`account/${programId}`}
                label={ellipsify(programId.toString())}
              />
            </p> */}
            <NftBuilderMintCreate name={name} symbol={symbol} uri={uri} wallet={wallet} verified={verified} share={share} />
          </AppHero>
        </div>
        {/* <NftBuilderProgram name={name} symbol={symbol} uri={uri} address={address} verified={verified} share={share} /> */}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
