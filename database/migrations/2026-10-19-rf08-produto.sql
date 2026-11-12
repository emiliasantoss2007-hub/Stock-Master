-- Migração RF-08 para instalações que já possuem a tabela produto.
-- Não remove nem altera registros existentes. Interrompe se houver SKU duplicado.
-- Remove resíduo caso uma execução anterior tenha sido interrompida.
DROP PROCEDURE IF EXISTS migrate_rf08_produto;

DELIMITER //
CREATE PROCEDURE migrate_rf08_produto()
BEGIN
    DECLARE coluna_estoque_minimo INT DEFAULT 0;
    DECLARE indice_sku_unico INT DEFAULT 0;
    DECLARE skus_duplicados INT DEFAULT 0;

    SELECT COUNT(*) INTO skus_duplicados
      FROM (
          SELECT sku
            FROM produto
           GROUP BY sku
          HAVING COUNT(*) > 1
      ) AS duplicados;

    IF skus_duplicados > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Migração RF-08 cancelada: existem SKUs duplicados; nenhum registro foi removido.';
    END IF;

    SELECT COUNT(*) INTO coluna_estoque_minimo
      FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'produto'
       AND COLUMN_NAME = 'estoque_minimo';

    IF coluna_estoque_minimo = 0 THEN
        ALTER TABLE produto
            ADD COLUMN estoque_minimo INT NOT NULL DEFAULT 0;
    END IF;

    SELECT COUNT(*) INTO indice_sku_unico
      FROM (
          SELECT INDEX_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
           WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = 'produto'
             AND NON_UNIQUE = 0
             AND INDEX_NAME <> 'PRIMARY'
           GROUP BY INDEX_NAME
          HAVING COUNT(*) = 1 AND MAX(COLUMN_NAME) = 'sku'
      ) AS indices_unicos;

    IF indice_sku_unico = 0 THEN
        ALTER TABLE produto
            ADD UNIQUE KEY uq_produto_sku (sku);
    END IF;
END//
DELIMITER ;

CALL migrate_rf08_produto();
DROP PROCEDURE IF EXISTS migrate_rf08_produto;