-- Creates the Videos table if it does not already exist.
IF OBJECT_ID(N'dbo.Videos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Videos (
        Id        INT IDENTITY(1,1) NOT NULL,
        Category  NVARCHAR(50)      NOT NULL,
        Title     NVARCHAR(200)     NOT NULL,
        YouTubeId NVARCHAR(20)      NOT NULL,
        SortOrder INT               NOT NULL,
        CONSTRAINT PK_Videos PRIMARY KEY CLUSTERED (Id)
    );
END;
