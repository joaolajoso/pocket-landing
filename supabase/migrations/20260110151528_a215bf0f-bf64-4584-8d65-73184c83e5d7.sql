-- Delete old dev.events entries with corrupted titles (containing random slugs)
DELETE FROM events 
WHERE source = 'dev.events' 
AND (
  title LIKE '%akibreae%' OR 
  title LIKE '%c1kucdt4%' OR 
  title LIKE '%mp3k47s9%' OR 
  title LIKE '%fhrk37%' OR 
  title LIKE '%frt4odzb%' OR 
  title LIKE '%ulibeeuu%' OR 
  title LIKE '%zd5bkxb6%' OR 
  title LIKE '%5kce%' OR 
  title LIKE '%mazjujru%' OR 
  title LIKE '%pne9tbls%' OR 
  title LIKE '%0iqa8isp%' OR 
  title LIKE '%xhycxkx3%' OR 
  title LIKE '%lu59cppr%' OR 
  title LIKE '%g2fflxdm%' OR 
  title LIKE '%y8mhnxix%'
);