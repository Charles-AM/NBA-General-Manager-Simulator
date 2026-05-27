# security_spec.md

## 1. Data Invariants
- A user profile can only be read or written by the authenticated owner (`request.auth.uid == userId`).
- A user cannot modify their account's critical identification fields or other users' drafted squads.
- Game simulation logs can only be created or viewed by authenticated users.
- Standard writes must verify that `request.auth.token.email_verified == true`.
- Games results are owned by their respective simulator users (`request.auth.uid == resource.data.userId`). They cannot be amended once created (terminal state).

## 2. The "Dirty Dozen" Adversarial Payloads

### Payload 1: Unauthorized Profile Read (Identity Spoofing)
- **Path**: `/users/another_user_id`
- **Method**: Reading someone else's draft team.
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 2: Unauthorized Profile Edit (Identity Spoofing)
- **Path**: `/users/another_user_id`
- **Payload**: `{ "teamName": "Malicious Name" }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 3: Create Profile for Other User
- **Path**: `/users/different_user_id`
- **Payload**: `{ "uid": "different_user_id", "email": "hacker@evil.com" }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 4: Spoofed Owner ID on Profile Create
- **Path**: `/users/victim_uid`
- **Payload**: `{ "uid": "attacker_uid", "email": "victim@gmail.com" }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 5: Unverified User Profile Creation
- **Auth context**: `email_verified == false`
- **Path**: `/users/attacker_uid`
- **Payload**: `{ "uid": "attacker_uid", "email": "unverified@gmail.com" }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 6: Game Log with Spoofed User Ownership
- **Path**: `/games/test_game_123`
- **Payload**: `{ "uid": "test_game_123", "userId": "victim_uid", "userScore": 100, "opponentScore": 90, "createdAt": "2026-05-27T14:55:00Z" }`
- **Expected Outcome**: `PERMISSION_DENIED` (User ID mismatch with auth context).

### Payload 7: Update Existing Game Results (Terminal State Bypass)
- **Path**: `/games/existing_game_id`
- **Payload**: `{ "userScore": 150 }`
- **Expected Outcome**: `PERMISSION_DENIED` (Games results are append-only / immutable once closed).

### Payload 8: Delete Someone Else's Game Result
- **Path**: `/games/victim_game_id`
- **Method**: DELETING a game logged by another user.
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 9: Blanket Reading of All Games Unconditionally
- **Path**: `/games` (as a bulk list query with no `userId` filter)
- **Method**: Retrieving all logged games without filtering.
- **Expected Outcome**: `PERMISSION_DENIED` (Query trust constraint - search criteria must filter by ownership).

### Payload 10: Injecting Extreme String Size (Resource Poisoning / Denial of Wallet)
- **Path**: `/users/user_uid`
- **Payload**: `{ "teamName": "...[1MB of data]..." }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 11: Create Game Record with Future or Custom Server Time
- **Path**: `/games/malicious_game`
- **Payload**: `{ "uid": "malicious_game", "userId": "user_uid", "userScore": 100, "opponentScore": 90, "createdAt": "3026-05-27T14:55:00Z" }`
- **Expected Outcome**: `PERMISSION_DENIED` (must use valid timestamps).

### Payload 12: Injecting Ghost Fields into user draft (Ghost Field / Shadow Update)
- **Path**: `/users/user_uid`
- **Payload**: `{ "uid": "user_uid", "email": "me@example.com", "isAdmin": true, "starters": [] }`
- **Expected Outcome**: `PERMISSION_DENIED`

## 3. Test Runner Specification
The testing suite `firestore.rules.test.ts` is implemented using `@firebase/rules-unit-testing` or manual mocking, verifying the security boundary is robust against arbitrary write attempts.
