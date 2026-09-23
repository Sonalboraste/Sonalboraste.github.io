-- Inserts the site's videos. Safe to re-run: skips any YouTubeId already present.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

INSERT INTO dbo.Videos (Category, Title, YouTubeId, SortOrder)
SELECT NewVideo.Category, NewVideo.Title, NewVideo.YouTubeId, NewVideo.SortOrder
FROM (VALUES
    (N'Merengue',           N'Le Gayi Le Gayi',                              N'1tYtPlRWZpA', 1),
    (N'Merengue',           N'Bijuria (Sunny Sanskari Ki Tulsi Kumari)',     N'GoM-5Qv_jqs', 2),
    (N'Cumbia',             N'Aaj Ki Raat',                                  N'-a2lXZnBkes', 1),
    (N'Cumbia',             N'Dil Dooba (Khakee)',                           N'wfHHkIPCwn8', 2),
    (N'Salsa',              N'Senorita',                                     N'uCO03Tx2MQU', 1),
    (N'Bhangra',            N'Gallan Goodiyaan (Dil Dhadakne Do)',           N'Bv45XCWHcvs', 1),
    (N'Marathi',            N'Zingaat (Sairaat)',                            N'Nrcf_043Xtg', 1),
    (N'Reggaeton',         (N'Reggaeton',         (N'Reggaeton',a Ghetto)',  N'w4vaxeM83p4', 1),
    (N'BollywoodFreestyle', N'Ankh Mare',                                    N'fvZQAgKNovE', 1),
    (N'BollywoodFreestyle', N'Nashe Si Chadh Gayi',                          N'2agJfazPtHg', 2)
) AS NewVideo (Category, Title, YouTubeId, SortOrder)
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Videos AS ExistingVideo
    WHERE ExistingVideo.YouTubeId = NewVideo.YouTubeId
);

COMMIT TRANSACTION;
