
FROM dpage/pgadmin4
COPY pgpassfile /tmp/pgpassfile
COPY passscript.sh /scripts/passscript.sh
CMD ["sh","/scripts/passscript.sh"]

# RUN mkdir -p -m 700 /var/lib/pgadmin/storage/pgadmin4_pgadmin.org 
# COPY passscript.sh .
# RUN ["chmod", "+x", "/scripts/passscript.sh"]

# ENTRYPOINT [ "passscript" ]
# RUN chown pgadmin:pgadmin /tmp/pgpassfile
# RUN mv /tmp/pgpassfile /var/lib/pgadmin/storage/pgadmin4_pgadmin.org
# RUN chmod 600 /var/lib/pgadmin/storage/pgadmin4_pgadmin.org/pgpassfile

