# dBattle - Decentralized Battle Streaming Platform

A livestreaming battle platform built on Flow blockchain where creators compete in real-time battles and viewers support them with token gifts.

## 🎯 Features

- **Flow Blockchain Integration**: Connect Flow wallet using FCL (Flow Client Library)
- **Token System**: dBattle Token (DBT) on Flow contract `0x7bb1b058bf341d24`
- **Live Battles**: Real-time streaming battles with gift-based scoring
- **Token Economy**: Claim, gift, and stake DBT tokens
- **Profile Management**: Track earnings, battles, and achievements

## 🔧 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: Flow (using @onflow/fcl)
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Real-time**: Supabase Realtime

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔗 Flow Token Integration

### Contract Address
- **Token Contract**: `0x7bb1b058bf341d24`
- **Network**: Flow Mainnet

### Integration Code

#### 1. Flow Configuration (`src/lib/flow.ts`)
```typescript
import * as fcl from "@onflow/fcl";

fcl.config()
  .put("app.detail.title", "dBattle")
  .put("app.detail.icon", "https://dbattle.com/icon.png")
  .put("flow.network", "mainnet")
  .put("accessNode.api", "https://access-mainnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
  .put("discovery.wallet.method.default", "IFRAME/RPC");

export { fcl };
```

#### 2. Token Utilities (`src/lib/flowToken.ts`)
```typescript
import * as fcl from "@onflow/fcl";

export const TOKEN_CONTRACT_ADDRESS = "0x7bb1b058bf341d24";

// Get token balance
export async function getTokenBalance(address: string): Promise<number> {
  const script = `
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

  const balance = await fcl.query({
    cadence: script,
    args: (arg: any, t: any) => [arg(address, t.Address)],
  });
  
  return parseFloat(balance);
}

// Transfer tokens
export async function transferTokens(amount: number, recipient: string): Promise<string> {
  const transaction = `
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

  const txId = await fcl.mutate({
    cadence: transaction,
    args: (arg: any, t: any) => [
      arg(amount.toFixed(8), t.UFix64),
      arg(recipient, t.Address),
    ],
    limit: 9999,
  });

  await fcl.tx(txId).onceSealed();
  return txId;
}
```

#### 3. React Hook (`src/hooks/useFlowUser.ts`)
```typescript
import { useEffect, useState } from "react";
import { fcl } from "@/lib/flow";

export type FlowUser = {
  addr?: string | null;
  loggedIn?: boolean | null;
};

export function useFlowUser() {
  const [user, setUser] = useState<FlowUser>({ loggedIn: null, addr: undefined });

  useEffect(() => {
    return fcl.currentUser.subscribe(setUser);
  }, []);

  const logIn = () => fcl.authenticate();
  const logOut = () => fcl.unauthenticate();

  return { user, logIn, logOut };
}
```

#### 4. Token Balance Hook (`src/hooks/useTokenBalance.ts`)
```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFlowUser } from "./useFlowUser";

export function useTokenBalance() {
  const { user } = useFlowUser();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!user.loggedIn) return;
    
    const { data } = await supabase.functions.invoke("get-token-balance");
    setBalance(data?.balance || 0);
  };

  const claimTokens = async () => {
    if (!user.addr) return false;
    
    const { data } = await supabase.functions.invoke("claim-tokens", {
      body: { flow_address: user.addr },
    });
    
    setBalance(data.total_balance);
    return true;
  };

  useEffect(() => {
    fetchBalance();
    
    // Real-time balance updates
    const channel = supabase
      .channel("profile-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchBalance)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.loggedIn]);

  return { balance, loading, claimTokens, fetchBalance };
}
```

## 📹 Real-Time Livestreaming Implementation

The platform uses **WebRTC** (Web Real-Time Communication) for seamless live streaming without requiring external API keys or services.

### How It Works

#### Frontend Components

**1. LiveStreamView Component** (`src/components/LiveStreamView.tsx`)
- Manages live video stream using browser MediaStream API
- Accesses user's camera and microphone via `navigator.mediaDevices.getUserMedia()`
- Provides real-time controls for video/audio toggle
- Displays live badge and stream status
- Handles stream cleanup on unmount

**2. GoLiveDialog Component** (`src/components/GoLiveDialog.tsx`)
- Workflow: Enter title → Create livestream → Start camera → Go live
- Integrates with backend to create livestream record
- Opens full-screen streaming view with controls
- Provides end stream functionality

#### Backend Flow

```
1. Creator clicks "Go Live" button
2. Frontend calls `create-livestream` edge function
3. Backend creates livestream record with status='live'
4. WebRTC accesses creator's camera/microphone
5. Stream appears on feed via Supabase Realtime
6. Viewers watch live stream in real-time
7. Creator clicks "End Stream"
8. Frontend calls `update-livestream-status` with status='ended'
```

### WebRTC Implementation

```typescript
// Access user media (no API keys needed)
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: true
});

// Display stream locally
videoRef.current.srcObject = stream;

// Toggle video/audio tracks
videoTrack.enabled = !videoTrack.enabled;
audioTrack.enabled = !audioTrack.enabled;

// Stop stream when done
stream.getTracks().forEach(track => track.stop());
```

### Real-Time Feed Integration

- Livestreams automatically appear on the main feed
- Uses Supabase Realtime for instant updates
- Status changes (live/ended) reflected immediately
- No manual refresh required

## 🔐 Backend Functions

### Database Schema

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  dcoin_balance INTEGER DEFAULT 1000,
  flow_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Livestreams table
CREATE TABLE livestreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users NOT NULL,
  collaborator_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  current_round INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Livestream rounds table
CREATE TABLE livestream_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID REFERENCES livestreams NOT NULL,
  round_number INTEGER NOT NULL,
  creator_score INTEGER DEFAULT 0,
  collaborator_score INTEGER DEFAULT 0,
  winner_id UUID,
  milestone INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Livestream gifts table
CREATE TABLE livestream_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID REFERENCES livestreams NOT NULL,
  round_id UUID REFERENCES livestream_rounds NOT NULL,
  from_user_id UUID REFERENCES auth.users NOT NULL,
  to_creator_id UUID REFERENCES auth.users NOT NULL,
  gift_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Edge Functions

#### 1. Create Livestream (`supabase/functions/create-livestream/index.ts`)

**Purpose**: Initialize a new livestream battle session

```typescript
// Request body
{
  title: string;
  description?: string;
  collaborator_id?: string;
}

// Response
{
  success: boolean;
  livestream: {
    id: string;
    creator_id: string;
    title: string;
    status: 'live';
    started_at: string;
  }
}
```

**Implementation**:
- Authenticates user via JWT token
- Creates livestream record in database
- Initializes first round with milestone (1000 points)
- Returns livestream data for frontend streaming

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('create-livestream', {
  body: { title: "Epic Battle!", description: "Let's go!" }
});
```

#### 2. Update Livestream Status (`supabase/functions/update-livestream-status/index.ts`)

**Purpose**: Change livestream status (end stream, update state)

```typescript
// Request body
{
  livestream_id: string;
  status: 'live' | 'ended';
}

// Response
{
  success: boolean;
  livestream: LivestreamObject;
}
```

**Implementation**:
- Verifies user owns the livestream
- Updates status and ended_at timestamp
- Closes all active rounds if ending stream
- Returns updated livestream object

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('update-livestream-status', {
  body: { livestream_id: "uuid", status: "ended" }
});
```

#### 3. Get Livestreams (`supabase/functions/get-livestreams/index.ts`)

**Purpose**: Fetch all active livestreams for the feed

**Response**:
```typescript
{
  livestreams: Array<{
    id: string;
    title: string;
    creator_id: string;
    status: 'live';
    viewer_count: number;
    started_at: string;
  }>
}
```

**Usage**:
```typescript
const { data } = await supabase.functions.invoke('get-livestreams');
```

#### 4. Claim Tokens (`supabase/functions/claim-tokens/index.ts`)

**Purpose**: Award initial tokens when users connect their Flow wallet

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get("Authorization")!.replace("Bearer ", "")
  );

  const { flow_address } = await req.json();

  // Check if user already has profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    // Create profile with initial 1000 tokens
    await supabase.from("profiles").insert({
      user_id: user.id,
      username: user.email?.split("@")[0] || "user",
      dcoin_balance: 1000,
      flow_address: flow_address,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        tokens_claimed: 1000, 
        total_balance: 1000 
      })
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      tokens_claimed: 0, 
      total_balance: profile.dcoin_balance 
    })
  );
});
```

**Usage**:
```typescript
const { data } = await supabase.functions.invoke("claim-tokens", {
  body: { flow_address: userFlowAddress }
});
```

#### 5. Get Token Balance (`supabase/functions/get-token-balance/index.ts`)

**Purpose**: Retrieve user's current DBT token balance

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get("Authorization")!.replace("Bearer ", "")
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("dcoin_balance, flow_address")
    .eq("user_id", user.id)
    .single();

  return new Response(
    JSON.stringify({
      balance: profile?.dcoin_balance || 0,
      flow_address: profile?.flow_address
    })
  );
});
```

**Usage**:
```typescript
const { data } = await supabase.functions.invoke("get-token-balance");
console.log(data.balance); // Current DBT balance
```

#### 6. Send Gift (`supabase/functions/send-gift/index.ts`)

**Purpose**: Process gift transactions during livestreams, deduct tokens, update scores

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user } } = await supabase.auth.getUser(
    req.headers.get("Authorization")!.replace("Bearer ", "")
  );

  const { livestream_id, to_creator_id, amount, gift_type } = await req.json();

  // Get user's balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("dcoin_balance")
    .eq("user_id", user.id)
    .single();

  if (profile.dcoin_balance < amount) {
    return new Response(
      JSON.stringify({ error: "Insufficient balance" }),
      { status: 400 }
    );
  }

  // Deduct tokens from sender
  await supabase
    .from("profiles")
    .update({ dcoin_balance: profile.dcoin_balance - amount })
    .eq("user_id", user.id);

  // Get active round
  const { data: round } = await supabase
    .from("livestream_rounds")
    .select("*")
    .eq("livestream_id", livestream_id)
    .eq("status", "active")
    .single();

  // Record gift
  await supabase.from("livestream_gifts").insert({
    livestream_id,
    round_id: round.id,
    from_user_id: user.id,
    to_creator_id,
    gift_type,
    amount,
  });

  // Update score
  const { data: livestream } = await supabase
    .from("livestreams")
    .select("creator_id")
    .eq("id", livestream_id)
    .single();

  const isCreator = to_creator_id === livestream.creator_id;
  const newScore = isCreator 
    ? round.creator_score + amount
    : round.collaborator_score + amount;

  await supabase
    .from("livestream_rounds")
    .update({
      [isCreator ? "creator_score" : "collaborator_score"]: newScore
    })
    .eq("id", round.id);

  // Check milestone
  const milestone_reached = newScore >= round.milestone;

  return new Response(
    JSON.stringify({ 
      success: true, 
      milestone_reached,
      new_round: milestone_reached ? round.round_number + 1 : round.round_number
    })
  );
});
```

**Usage**:
```typescript
const { data } = await supabase.functions.invoke("send-gift", {
  body: {
    livestream_id: "uuid",
    to_creator_id: "uuid",
    amount: 100,
    gift_type: "Lion"
  }
});
```

## 🏗️ Backend Architecture

```
supabase/
├── functions/
│   ├── create-livestream/
│   │   └── index.ts          # Initialize new battle stream
│   ├── update-livestream-status/
│   │   └── index.ts          # Update livestream state (end stream)
│   ├── get-livestreams/
│   │   └── index.ts          # Fetch active livestreams
│   ├── claim-tokens/
│   │   └── index.ts          # Award initial tokens on wallet connection
│   ├── get-token-balance/
│   │   └── index.ts          # Fetch user's DBT balance
│   └── send-gift/
│       └── index.ts          # Process gift transactions
├── migrations/
│   └── [timestamp]_*.sql     # Database schema changes
└── config.toml               # Function configurations

Database Tables:
├── profiles              # User profiles & token balances
├── livestreams          # Active/past livestream battles
├── livestream_rounds    # Round-by-round battle data
└── livestream_gifts     # Gift transaction history
```

## 🔄 Token Flow

1. **Connect Wallet** → User authenticates with Flow wallet via FCL
2. **Claim Tokens** → `claim-tokens` awards 1000 DBT on first connection
3. **View Balance** → `get-token-balance` displays current DBT holdings
4. **Gift Tokens** → `send-gift` deducts DBT, updates recipient score
5. **Earn Tokens** → Creators earn DBT from gifts received during battles
6. **Profile Display** → Token balance shown on profile page

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Flow Documentation](https://developers.flow.com/)
- [FCL Documentation](https://developers.flow.com/tools/fcl-js)
- [Supabase Documentation](https://supabase.com/docs)
