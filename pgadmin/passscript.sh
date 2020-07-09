#!/bin/bash
mkdir -m 700 /var/lib/pgadmin/storage/pgadmin4_pgadmin.org
chown pgadmin:pgadmin /tmp/pgpassfile
mv /tmp/pgpassfile /var/lib/pgadmin/storage/pgadmin4_pgadmin.org
chmod 600 /var/lib/pgadmin/storage/pgadmin4_pgadmin.org/pgpassfile