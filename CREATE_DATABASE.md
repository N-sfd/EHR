# Create staff_db Database

The `staff_db` database is required for the backend service to run. Follow one of these methods to create it:

## Method 1: Using pgAdmin (Easiest)

1. Open **pgAdmin** (PostgreSQL administration tool)
2. Connect to your PostgreSQL server (usually `localhost`)
3. Right-click on **"Databases"** in the left panel
4. Select **"Create"** > **"Database..."**
5. Enter database name: `staff_db`
6. Click **"Save"**

## Method 2: Using psql Command Line

1. Open PowerShell or Command Prompt
2. Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\16\bin\`)
3. Run:
   ```powershell
   .\psql.exe -U postgres
   ```
4. Enter your PostgreSQL password (default: `postgres`)
5. Run the SQL command:
   ```sql
   CREATE DATABASE staff_db;
   ```
6. Exit psql: `\q`

## Method 3: Using PowerShell Script

Run the provided script:
```powershell
.\create-staff-db.ps1
```

This script will:
- Find your PostgreSQL installation
- Prompt for password
- Create the database automatically

## Method 4: Direct SQL Command (if psql is in PATH)

```powershell
psql -U postgres -c "CREATE DATABASE staff_db;"
```

## Verify Database Creation

After creating the database, verify it exists:

```powershell
psql -U postgres -l
```

You should see `staff_db` in the list of databases.

## Database Configuration

The backend is configured to use:
- **Database**: `staff_db`
- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: `postgres`

These settings are in `backend/src/main/resources/application.yml`

## After Creating Database

1. Start the backend service:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

2. Or use the provided script:
   ```powershell
   .\start-backend.ps1
   ```

The backend will automatically create the necessary tables using Hibernate's `ddl-auto: update` setting.

