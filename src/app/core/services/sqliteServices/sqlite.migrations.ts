export interface DbUpgradeVersion {
    toVersion: number;
    statements: string[];
}

export enum SqliteTableName {
    users = 'Users',
    categories = 'Categories',
    tasks = 'Tasks',
}


export const SqliteMigrations: DbUpgradeVersion[] = [
    {
        toVersion: 1,
        statements: [`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                onboarding_check INTEGER NOT NULL DEFAULT 0
            );`,
            `CREATE TABLE IF NOT EXISTS Categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                createdDate TEXT DEFAULT (datetime('now')),
                updatedDate TEXT DEFAULT (datetime('now'))
            );`,
            `CREATE TABLE IF NOT EXISTS Tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                priority INTEGER NOT NULL DEFAULT 1,
                due_date TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                CHECK(status IN ('pending', 'done')),
                category_id INTEGER,
                created_at TEXT NOT NULL,
                completed_at TEXT,
                
                FOREIGN KEY(category_id)
                REFERENCES Categories(id)
                ON DELETE SET NULL
            );`,
            `INSERT INTO Categories (name) VALUES ('Personal'), ('Trabajo'), ('Familiar');`,
            `INSERT INTO Users (onboarding_check) VALUES (0);`
        ]
    }
];
