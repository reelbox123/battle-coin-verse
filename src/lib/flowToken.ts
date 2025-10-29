import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// dBattle Token Contract Address
export const TOKEN_CONTRACT_ADDRESS = "0x7bb1b058bf341d24";

// Script to get token balance
const GET_BALANCE_SCRIPT = `
import FungibleToken from 0xf233dcee88fe0abe
import DBattleToken from ${TOKEN_CONTRACT_ADDRESS}

pub fun main(address: Address): UFix64 {
  let account = getAccount(address)
  let vaultRef = account.getCapability(/public/DBattleTokenBalance)
    .borrow<&DBattleToken.Vault{FungibleToken.Balance}>()
    ?? panic("Could not borrow balance reference")
  
  return vaultRef.balance
}
`;

// Transaction to transfer tokens
const TRANSFER_TRANSACTION = `
import FungibleToken from 0xf233dcee88fe0abe
import DBattleToken from ${TOKEN_CONTRACT_ADDRESS}

transaction(amount: UFix64, recipient: Address) {
  let sentVault: @FungibleToken.Vault
  
  prepare(signer: AuthAccount) {
    let vaultRef = signer.borrow<&DBattleToken.Vault>(from: /storage/DBattleTokenVault)
      ?? panic("Could not borrow reference to the owner's Vault")
    
    self.sentVault <- vaultRef.withdraw(amount: amount)
  }
  
  execute {
    let receiverRef = getAccount(recipient)
      .getCapability(/public/DBattleTokenReceiver)
      .borrow<&{FungibleToken.Receiver}>()
      ?? panic("Could not borrow receiver reference")
    
    receiverRef.deposit(from: <-self.sentVault)
  }
}
`;

/**
 * Get token balance for a Flow address
 */
export async function getTokenBalance(address: string): Promise<number> {
  try {
    const balance = await fcl.query({
      cadence: GET_BALANCE_SCRIPT,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });
    return parseFloat(balance);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return 0;
  }
}

/**
 * Transfer tokens to another address
 */
export async function transferTokens(
  amount: number,
  recipientAddress: string
): Promise<string> {
  try {
    const transactionId = await fcl.mutate({
      cadence: TRANSFER_TRANSACTION,
      args: (arg: any, t: any) => [
        arg(amount.toFixed(8), t.UFix64),
        arg(recipientAddress, t.Address),
      ],
      limit: 9999,
    });

    // Wait for transaction to be sealed
    await fcl.tx(transactionId).onceSealed();
    
    return transactionId;
  } catch (error) {
    console.error("Error transferring tokens:", error);
    throw error;
  }
}

/**
 * Setup token vault for a new account (if needed)
 */
export async function setupTokenVault(): Promise<string> {
  const SETUP_VAULT_TRANSACTION = `
import FungibleToken from 0xf233dcee88fe0abe
import DBattleToken from ${TOKEN_CONTRACT_ADDRESS}

transaction {
  prepare(signer: AuthAccount) {
    if signer.borrow<&DBattleToken.Vault>(from: /storage/DBattleTokenVault) == nil {
      signer.save(<-DBattleToken.createEmptyVault(), to: /storage/DBattleTokenVault)
      
      signer.link<&DBattleToken.Vault{FungibleToken.Receiver}>(
        /public/DBattleTokenReceiver,
        target: /storage/DBattleTokenVault
      )
      
      signer.link<&DBattleToken.Vault{FungibleToken.Balance}>(
        /public/DBattleTokenBalance,
        target: /storage/DBattleTokenVault
      )
    }
  }
}
`;

  try {
    const transactionId = await fcl.mutate({
      cadence: SETUP_VAULT_TRANSACTION,
      limit: 9999,
    });

    await fcl.tx(transactionId).onceSealed();
    return transactionId;
  } catch (error) {
    console.error("Error setting up token vault:", error);
    throw error;
  }
}
