INSERT INTO teams(pokemon, teamName, tier)
VALUES (?, ?, ?)

-- WHERE (name = @pokemon AND team IS NULL)
--     AND (
--         NOT EXISTS( SELECT * FROM pokemon WHERE (team = @team AND tier = 'OU1'))
--         OR NOT EXISTS( SELECT * FROM pokemon WHERE (team = @team AND tier = 'OU2'))
--         OR (SELECT * FROM pokemon WHERE (team = @team AND tier = 'UU') HAVING COUNT(*) < 2)
--         OR (SELECT * FROM pokemon WHERE (team = @team AND tier = 'RU') HAVING COUNT(*) < 2)
--         OR (SELECT * FROM pokemon WHERE (team = @team AND tier = 'NU') HAVING COUNT(*) < 2)
--         OR (SELECT * FROM pokemon WHERE (team = @team AND tier = 'PU') HAVING COUNT(*) < 2)
--         );