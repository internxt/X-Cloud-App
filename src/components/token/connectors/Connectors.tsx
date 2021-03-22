import { WalletLinkConnector } from '@web3-react/walletlink-connector';

const NETWORK_URL = 'https://mainnet.infura.io/v3/fc9e149bd0b7477591a320eee8ca22dc';

export const WalletLink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Internxt',
  appLogoUrl: 'https://i.ibb.co/NFhxfTZ/round.png'
});