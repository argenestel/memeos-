// lib/fourmeme.ts
// Four.meme API helpers

const BASE = 'https://four.meme/meme-api/v1';

export type FourMemeToken = {
  tokenId: number;
  name: string;
  shortName: string;
  tokenAddress: string;
  userAddress: string;
  symbol: string;
  progress: string;
  price: string;
  cap: string;        // market cap in USD
  hold: number;       // holder count
  img: string;
  tag: string;
  increase: string;   // 24h increase %
  hourIncrease: string;
  volume: string;     // 24h volume in BNB
  day1Vol: string;
  taxFee: string;
  createDate: string;
  status: string;
  aiCreator: boolean;
};

export type FourMemeTokenDetail = {
  id: number;
  address: string;
  image: string;
  name: string;
  shortName: string;
  descr: string;
  twitterUrl: string;
  totalAmount: string;
  saleAmount: string;
  launchTime: number;
  status: string;
  raisedAmount: string;
  networkCode: string;
  label: string;
  dexType: string;
  userId: number;
  userAddress: string;
  userName: string;
  tokenPrice: {
    price: string;
    maxPrice: string;
    increase: string;
    marketCap: string;
    trading: string;
    dayIncrease: string;
    hourIncrease: string;
    fourHourIncrease: string;
    dayTrading: string;
    raisedAmount: string;
    progress: string;
    liquidity: string;
    holderCount: number;
  };
};

export type SearchType = 'HOT' | 'NEW' | 'VOL';

export async function fetchTokenList(
  pageIndex = 1,
  pageSize = 20,
  type: SearchType = 'NEW',
): Promise<FourMemeToken[]> {
  const isNew = type === 'NEW';
  const isVol = type === 'VOL';

  const body = {
    pageIndex,
    pageSize,
    type,
    ...(isNew ? { sort: 'DESC', listType: 'NOR' } : {}),
    ...(isVol ? { status: 'PUBLISH', listType: 'NOR' } : {}),
    ...(!isNew && !isVol ? { listType: 'ADV' } : {})
  };

  const res = await fetch(`${BASE}/public/token/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`four.meme search failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`four.meme search error: ${json.msg}`);
  return json.data as FourMemeToken[];
}

export async function fetchUserTokens(userId: string | number): Promise<any[]> {
  const url = `${BASE}/private/user/token/create/list?userId=${userId}&orderBy=CREATE_DATE&sorted=DESC&tokenName=&pageIndex=1&pageSize=300&symbol=`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json, text/plain, */*',
      'meme-web-access': 'MTc3NjY5NDU5OTMxOF8weDNkOTY5NmM3ODEwMGVmMjEyZGExNTdjNDViN2VlZjgyNzUxZGU0OWRfUkVEdUNC.o5MJ4P7DcnDIShInLsPLdfrXPqp6dvpJBikWLPPr6-U',
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`four.meme user tokens failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`four.meme user tokens error: ${json.msg}`);
  return json.data as any[];
}

export async function fetchTokenDetail(address: string): Promise<FourMemeTokenDetail> {
  const res = await fetch(
    `${BASE}/private/token/get/v2?address=${address}`,
    { next: { revalidate: 0 } },
  );

  if (!res.ok) throw new Error(`four.meme detail failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`four.meme detail error: ${json.msg}`);
  return json.data as FourMemeTokenDetail;
}

export function imgUrl(img: string): string {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `https://static.four.meme${img.startsWith('/') ? '' : '/'}${img}`;
}

export function formatCap(cap: string): string {
  const n = parseFloat(cap);
  if (isNaN(n)) return '$?';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function formatIncrease(inc: string): string {
  const n = parseFloat(inc) * 100;
  if (isNaN(n)) return '0%';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

export function formatProgress(progress: string): number {
  return Math.min(Math.round(parseFloat(progress) * 100), 100);
}
