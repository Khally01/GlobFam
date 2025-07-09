# Prisma Database Setup Guide

## 🔐 Step 1: Get Your Database Password from Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (globfam)
3. Click on **Settings** (gear icon) in the left sidebar
4. Click on **Database** 
5. Look for **Connection string** section
6. You'll see a URI that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.gbgjopvvkdfkcwuzijjz.supabase.co:5432/postgres
   ```
7. Click "Reveal password" or copy the password shown

## 📝 Step 2: Update Your .env.local

Replace `[YOUR-PASSWORD]` in your `.env.local` file with the actual password:

```bash
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD_HERE@db.gbgjopvvkdfkcwuzijjz.supabase.co:5432/postgres?schema=public"
```

## 🚀 Step 3: Install Dependencies & Setup Prisma

```bash
# Install dependencies
npm install

# Pull your existing database schema
npx prisma db pull

# Generate Prisma Client
npx prisma generate
```

## 🛠️ Step 4: Verify Setup

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a web interface where you can see all your tables and data.

## 📊 Available Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio (GUI for your database)
- `npm run prisma:migrate` - Create and run migrations
- `npm run prisma:push` - Push schema changes without migrations
- `npm run prisma:pull` - Pull schema from database

## 🔍 Next Steps

After completing the setup:
1. Prisma will create models for all your existing tables
2. You'll have type-safe database access
3. No more manual SQL queries needed
4. Automatic migrations for schema changes

## ⚠️ Important Notes

- Keep your database password secure
- Never commit `.env.local` to git
- The password is different from your Supabase dashboard password
- If you reset the database password in Supabase, update it here too