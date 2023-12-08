import { FC } from 'react'

import { publicResolverCcipABI, publicResolverCcipAddress } from '@/wagmi.generated'
import { convertEVMChainIdToCoinType } from '@ensdomains/address-encoder'
import { BookUser, Coins } from 'lucide-react'
import { Chain, namehash, zeroAddress } from 'viem'
import { avalancheFuji } from 'viem/chains'
import { useBalance, useContractRead } from 'wagmi'

import { DomainContext } from '@/app/atoms'
import ChainIcon from '@/components/chain-icon'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'
import { copyToClipboard } from '@/utils/copy-to-clipboard'

interface ChainDetailsHoverCardProps {
  chain: Chain
  domainContext: DomainContext
}
export const ChainDetailsHoverCard: FC<ChainDetailsHoverCardProps> = (props) => {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>
        <button
          type="button"
          className="flex rounded-full outline-none ring-offset-background transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChainIcon chain={props.chain} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-[22.2rem] max-w-full overflow-hidden" sideOffset={12}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2">
            <ChainIcon size={32} chain={props.chain} />
            <h4 className="font-semibold leading-none">{props.chain.name}</h4>
          </div>
          <div className="flex flex-col gap-3 rounded-sm border bg-muted p-2 pb-3">
            <DomainChainResolvedAddress {...props} />
            <Separator className="-mx-2 w-auto" />
            <DomainChainFetchedBalance {...props} />
          </div>
          <div className="text-center text-xs text-muted-foreground">
            Resolved smart wallet on chain {props.chain.id} via ENSIP-11 ⚡
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

const DomainChainResolvedAddress: FC<ChainDetailsHoverCardProps> = ({ chain, domainContext }) => {
  const { domain } = domainContext
  const contractRead = useContractRead({
    chainId: avalancheFuji.id,
    address: publicResolverCcipAddress[avalancheFuji.id],
    abi: publicResolverCcipABI,
    functionName: 'addr',
    args: [namehash(domain), BigInt(convertEVMChainIdToCoinType(chain.id))],
  })

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <BookUser size={14} />
        <h5 className="text-sm font-medium">Resolved Address</h5>
        <Button size="xs" className="ml-auto" onClick={() => copyToClipboard(contractRead.data)}>
          {/* <Copy size={14} className="mr-1" /> */}
          Copy
        </Button>
      </div>
      <div className="h-[13.5px] font-mono text-xs text-muted-foreground">
        {!contractRead.isLoading && (
          <span className="animate-in fade-in-0">{contractRead.data || zeroAddress}</span>
        )}
      </div>
    </div>
  )
}

const DomainChainFetchedBalance: FC<ChainDetailsHoverCardProps> = ({ chain, domainContext }) => {
  const { domain } = domainContext
  const contractRead = useContractRead({
    chainId: avalancheFuji.id,
    address: publicResolverCcipAddress[avalancheFuji.id],
    abi: publicResolverCcipABI,
    functionName: 'addr',
    args: [namehash(domain), BigInt(convertEVMChainIdToCoinType(chain.id))],
  })
  const balanceRead = useBalance({
    address: contractRead.data,
    enabled: !!contractRead.data,
    chainId: chain.id,
    watch: true,
  })

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Coins size={14} />
        <h5 className="text-sm font-medium">Fetched Balance</h5>
      </div>
      <div className="h-[13.5px] font-mono text-xs text-muted-foreground">
        {!balanceRead.isLoading && (
          <span className="animate-in fade-in-0">
            {balanceRead.data?.formatted || '0'} {balanceRead.data?.symbol}
          </span>
        )}
      </div>
    </div>
  )
}