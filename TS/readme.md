# Discount Engine (TypeScript)

## Prerequisites
- Node.js and npm installed on your machine

## Setup
1. Open your terminal and navigate to the `TS` folder:
   ```bash
   cd TS
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```

## Install TypeScript (Optional)
If you want to use the `tsc` command globally:
```bash
npm install -g typescript
```

## Running the Program
To run the discount engine manually (for example, `discountEngine.ts`):
```bash
npx ts-node discountEngine.ts
```
Or if you have installed `ts-node` globally:
```bash
ts-node discountEngine.ts
```

## Compile TypeScript to JavaScript
To compile all `.ts` files to `.js`:
```bash
npx tsc
```
Or if you have installed TypeScript globally:
```bash
tsc
```
The compiled JavaScript files will appear in the folder specified in `tsconfig.json` (default: same as the source files).

## Running Unit Tests
To run all tests:
```bash
npx jest
```
To see detailed test output:
```bash
npx jest --verbose
```
