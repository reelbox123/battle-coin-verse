import { FlowProvider } from '@onflow/react-sdk';
import flowJSON from '../../flow.json';

export default function FlowProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <FlowProvider
      config={{
        accessNodeUrl: 'https://access-mainnet.onflow.org',
        flowNetwork: 'mainnet',
        appDetailTitle: 'dBattle',
        appDetailIcon: 'https://dbattle.com/icon.png',
        appDetailDescription: 'A decentralized battle platform on Flow',
        appDetailUrl: 'https://dbattle.com',
      }}
      flowJson={flowJSON}
    >
      {children}
    </FlowProvider>
  );
}
