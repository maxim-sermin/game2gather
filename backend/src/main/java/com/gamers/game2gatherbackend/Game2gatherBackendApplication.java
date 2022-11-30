package com.gamers.game2gatherbackend;

import liquibase.integration.spring.SpringLiquibase;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.nativex.hint.NativeHint;
import org.springframework.nativex.hint.TypeAccess;
import org.springframework.nativex.hint.TypeHint;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Properties;


@NativeHint(
		trigger = SpringLiquibase.class,
		types = {
				@TypeHint(types = {
						liquibase.configuration.LiquibaseConfiguration.class,
						liquibase.sql.visitor.ReplaceSqlVisitor.class,
						liquibase.hub.HubServiceFactory.class,
						liquibase.AbstractExtensibleObject.class,
						liquibase.change.AbstractChange.class,
						liquibase.change.AbstractSQLChange.class,
						liquibase.change.ChangeFactory.class,
						liquibase.change.ColumnConfig.class,
						liquibase.change.ConstraintsConfig.class,
						liquibase.change.core.AddAutoIncrementChange.class, // all the ...Change ones are required
						liquibase.change.core.AddColumnChange.class,
						liquibase.change.core.AddDefaultValueChange.class,
						liquibase.change.core.AddForeignKeyConstraintChange.class,
						liquibase.change.core.AddNotNullConstraintChange.class,
						liquibase.change.core.AddPrimaryKeyChange.class,
						liquibase.change.core.AddUniqueConstraintChange.class,
						liquibase.change.core.CreateIndexChange.class,
						liquibase.change.core.CreateTableChange.class,
						liquibase.change.core.DeleteDataChange.class,
						liquibase.change.core.DropAllForeignKeyConstraintsChange.class,
						liquibase.change.core.DropColumnChange.class,
						liquibase.change.core.DropDefaultValueChange.class,
						liquibase.change.core.DropForeignKeyConstraintChange.class,
						liquibase.change.core.DropIndexChange.class,
						liquibase.change.core.DropNotNullConstraintChange.class,
						liquibase.change.core.DropPrimaryKeyChange.class,
						liquibase.change.core.DropTableChange.class,
						liquibase.change.core.DropUniqueConstraintChange.class,
						liquibase.change.core.InsertDataChange.class,
						liquibase.change.core.LoadDataChange.class,
						liquibase.change.core.LoadUpdateDataChange.class,
						liquibase.change.core.MergeColumnChange.class,
						liquibase.change.core.ModifyDataTypeChange.class,
						liquibase.change.core.RawSQLChange.class,
						liquibase.change.core.RenameColumnChange.class,
						liquibase.change.core.RenameTableChange.class,
						liquibase.change.core.UpdateDataChange.class,
						liquibase.change.custom.CustomChangeWrapper.class,
						liquibase.changelog.StandardChangeLogHistoryService.class,
						liquibase.database.core.PostgresDatabase.class,
						liquibase.database.jvm.JdbcConnection.class,
						liquibase.datatype.core.BigIntType.class,
						liquibase.datatype.core.BooleanType.class,
						liquibase.datatype.core.FloatType.class,
						liquibase.datatype.core.SmallIntType.class,
						liquibase.datatype.core.TimestampType.class,
						liquibase.datatype.core.UnknownType.class,
						liquibase.datatype.core.VarcharType.class,
						liquibase.executor.ExecutorService.class,
						liquibase.executor.jvm.JdbcExecutor.class,
						liquibase.license.LicenseServiceFactory.class, // required <init>, tested
						liquibase.lockservice.StandardLockService.class,
						liquibase.logging.core.LogServiceFactory.class,
						liquibase.plugin.AbstractPlugin.class,
						liquibase.serializer.AbstractLiquibaseSerializable.class,
						liquibase.sql.visitor.AppendSqlVisitor.class,
						liquibase.sql.visitor.PrependSqlVisitor.class,
						liquibase.sql.visitor.RegExpReplaceSqlVisitor.class,
						liquibase.sql.visitor.ReplaceSqlVisitor.class,
						liquibase.change.AddColumnConfig.class // required, tested

				}, access = {TypeAccess.DECLARED_CLASSES, TypeAccess.DECLARED_CONSTRUCTORS, TypeAccess.DECLARED_FIELDS, TypeAccess.DECLARED_METHODS, TypeAccess.PUBLIC_CLASSES, TypeAccess.PUBLIC_CONSTRUCTORS, TypeAccess.PUBLIC_FIELDS, TypeAccess.PUBLIC_METHODS, TypeAccess.RESOURCE}),
		}
)
@SpringBootApplication
public class Game2gatherBackendApplication {

	public static void main(String[] args) throws URISyntaxException {
		SpringApplication application =  new SpringApplication(Game2gatherBackendApplication.class);

		URI dbUri = new URI(System.getenv("DATABASE_URL"));

		String username = dbUri.getUserInfo().split(":")[0];
		String password = dbUri.getUserInfo().split(":")[1];
		String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();

		String jdbc_ssl = System.getenv("JDBC_SSL");
		if ("true".equals(jdbc_ssl)) {
			dbUrl += "?sslmode=require";
		}

		Properties properties = new Properties();
		properties.put("spring.datasource.url", dbUrl);
		properties.put("spring.datasource.username", username);
		properties.put("spring.datasource.password", password);
		application.setDefaultProperties(properties);

		application.run(args);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
