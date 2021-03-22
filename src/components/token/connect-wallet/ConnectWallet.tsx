import { Web3Provider } from '@ethersproject/providers';
import { connectorsByName } from '../utils/tokenUtils';
import { OptionCard } from '../option-card/OptionCard';

class ConnectWallet {
  
  // function getLibrary(provider: any): Web3Provider {
  //   const library = new Web3Provider(provider);

  //   library.pollingInterval = 12000;
  //   return library;
  // }

  function renderWallets() {
    {Object.keys(connectorsByName).map(name => {
      const currentConnector = connectorsByName[name];
      const activating = currentConnector === activatingConnector;
      const connected = currentConnector === connector
      const disabled = !triedEager || !!activatingConnector || connected || !!error

      return (
        <OptionCard walletName={name}/>
      )
    })}
  };

};

export default ConnectWallet;