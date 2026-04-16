-- Apagar eventos do devs.com.pt com datas incorretas (todos foram para 2026-01-10)
DELETE FROM events WHERE source = 'devs.com.pt';