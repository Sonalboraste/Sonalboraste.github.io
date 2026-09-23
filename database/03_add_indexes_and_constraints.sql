-- Renames the primary key, prevents duplicate videos, and adds a covering index
-- for the API query (ORDER BY Category, SortOrder). Safe to re-run.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- 1. Rename the auto-generated primary key to PK_Videos
DECLARE @CurrentPrimaryKeyName SYSNAME;

SELECT @CurrentPrimaryKeyName = KeyConstraint.name
FROM sys.key_constraints AS KeyConstraint
WHERE KeyConstraint.parent_object_id = OBJECT_ID(N'dbo.Videos')
  AND KeyConstraint.type = 'PK';

IF @CurrentPrimaryKeyName <> N'PK_Videos'
BEGIN
    DECLARE @QualifiedPrimaryKeyName NVARCHAR(300) = N'dbo.' + QUOTENAME(@CurrentPrimaryKeyName);
    EXEC sp_rename @objname = @QualifiedPrimaryKeyName, @newname = N'PK_Videos', @objtype = N'OBJECT';
END;

-- 2. Prevent duplicate videos (stop with a clear message if duplicates already exist)
IF EXISTS (
    SELECT DuplicateCheck.YouTubeId
    FROM dbo.Videos AS DuplicateCheck
    GROUP BY DuplicateCheck.YouTubeId
    HAVING COUNT(*) > 1
)
    THROW 50002, N'Duplicate YouTubeId values exist. Remove them before adding the unique constraint.', 1;

IF NOT EXISTS (
    SELECT 1
    FROM sys.key_constraints AS KeyConstraint
    WHERE KeyConstraint.parent_object_id = OBJECT_ID(N'dbo.Videos')
      AND KeyConstraint.name = N'UQ_Videos_YouTubeId'
)
    ALTER TABLE dbo.Videos
        ADD CONSTRAINT UQ_Videos_YouTubeId UNIQUE (YouTubeId);

-- 3. Covering index for the API query
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes AS IndexInfo
    WHERE IndexInfo.object_id = OBJECT_ID(N'dbo.Videos')
      AND IndexInfo.name = N'IX_Videos_Category_SortOrder'
)
    CREATE NONCLUSTERED INDEX IX_Videos_Category_SortOrder
        ON dbo.Videos (Category, SortOrder)
        INCLUDE (Title, YouTubeId);

COMMIT TRANSACTION;
