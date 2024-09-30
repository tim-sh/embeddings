const { apiUrl } = require('../mox/moc-konfig')

const { textRemoveCodeDelimiters } = require('../../src/pipeline/text-remove-code-delimiters')
const { textTransformPaths } = require('../../src/pipeline/text-transform-paths')
const { textTransformStacksAndWhitespace } = require('../../src/pipeline/text-transform-stacks-and-whitespace')
const { issueToText } = require('../../src/pipeline/issue-to-text')
const { issueAddCommentTexts } = require('../../src/pipeline/issue-add-comment-texts')
const { issueTransformLabels } = require('../../src/pipeline/issue-transform-labels')

describe('combined-issue-to-clean-text', () => {

  beforeAll(async () => {
    const { default: fetchMock } = await import('fetch-mock')
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/123/comments`, [
      { body: 'comment 1', user: { type: 'User', login: 'user1' }, author_association: 'MEMBER' },
      { body: `I'm a tea bot`, user: { type: 'Bot' } },
      { body: 'comment 2', user: { type: 'User' }, created_at: '2001-01-01T01:00:00Z' },
      { body: 'comment 3', user: null },
      { body: undefined, user: { type: 'User' } },
    ])
  })

  it('should x', async () => {
    const issue = {
      number: 123,
      title: 'Something went wrong',
      labels: ['bug'],
      body: `### What happened?

We have a select query where we are trying to do a deep read into an association. 
Here is the query. 
\`\`\`
CqnSelect select = Select.from(Foo.class)
                            .columns(daily -> daily._all(), daily -> daily.locations().expand())
                            .orderBy(getOrderBy(viewName));
\`\`\`
Here are the entity files.
----------------------------------------------------------------------------------------------------------------------------

\`\`\`
view FooView as select from Bar
{
        key bla,
                     as bar
    };
\`\`\`

And the error says Invalid column BAR. We checked our view schema as well this column is not available in our schema. Not sure how the column name is getting generated like this.
\`\`\`
<img width="452" alt="image" src="https://media.github.tools.example.com/bar">
\`\`\`


### Steps to reproduce

Just a normal run will give this issue.

### Versions

| bar | <Add your repository here> |
|:---------------------- | ----------- |
|        | -- missing  |
| @bar/baz      | 4.5.0       |


### OS / Environment

Cloud Foundry

### Relevant log output

\`\`\`shell
com.example.services.impl.ContextualizedFooException: Error executing the statement (service 'PersistenceService$Default', event 'READ', entity 'PrivateDownloadService.fooDailyForDownload')
        at com.example.services.impl.ServiceImpl.dispatch(ServiceImpl.java:256)
        at com.example.services.impl.ServiceImpl.lambda$dispatchInChangeSetContext$2(ServiceImpl.java:203)
        at com.example.services.impl.runtime.ChangeSetContextRunnerImpl.lambda$run$1(ChangeSetContextRunnerImpl.java:56)
        at com.example.services.impl.runtime.ChangeSetContextRunnerImpl.open(ChangeSetContextRunnerImpl.java:70)
        at com.example.services.impl.runtime.ChangeSetContextRunnerImpl.run(ChangeSetContextRunnerImpl.java:49)
        at com.example.services.impl.runtime.ChangeSetContextRunnerImpl.run(ChangeSetContextRunnerImpl.java:55)
        at com.example.services.impl.ServiceImpl.dispatchInChangeSetContext(ServiceImpl.java:203)
        at com.example.services.impl.ServiceImpl.emit(ServiceImpl.java:188)
        at com.example.services.ServiceDelegator.emit(ServiceDelegator.java:33)
        at com.example.services.utils.services.AbstractCqnService.run(AbstractCqnService.java:53)
        at com.example.services.utils.services.AbstractCqnService.run(AbstractCqnService.java:43)
        at customer.auditportal.utility.FooRuntimeUtil.lambda$runSelect$5(FooRuntimeUtil.java:65)
        at com.example.services.impl.runtime.RequestContextRunnerImpl.run(RequestContextRunnerImpl.java:272)
        at customer.auditportal.utility.FooRuntimeUtil.runSelect(FooRuntimeUtil.java:64)
        at customer.auditportal.handler.DownloadServiceHandler.generateFile(DownloadServiceHandler.java:646)
        at customer.auditportal.handler.DownloadServiceHandler.generateFiles(DownloadServiceHandler.java:476)
        at customer.auditportal.handler.DownloadServiceHandler.generateAuditFile(DownloadServiceHandler.java:358)
        at customer.auditportal.handler.DownloadServiceHandler.lambda$onGenerateAuditFile$20(DownloadServiceHandler.java:324)
        at com.example.services.impl.runtime.RequestContextRunnerImpl.lambda$run$3(RequestContextRunnerImpl.java:213)
        at com.example.services.impl.runtime.RequestContextRunnerImpl.run(RequestContextRunnerImpl.java:272)
        at com.example.services.impl.runtime.RequestContextRunnerImpl.run(RequestContextRunnerImpl.java:212)
        at customer.auditportal.handler.DownloadServiceHandler.lambda$onGenerateAuditFile$21(DownloadServiceHandler.java:323)
        at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144)
        at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642)
        at java.base/java.lang.Thread.run(Thread.java:1583)
Caused by: com.example.FooDataStoreException: Error executing the statement
        at com.example.impl.ExceptionHandler.dataStoreException(ExceptionHandler.java:62)
        at com.example.impl.JDBCClient.executeQuery(JDBCClient.java:211)
        at com.example.impl.FooDataStoreImpl.executeResolvedQuery(FooDataStoreImpl.java:180)
        at com.example.impl.FooDataStoreImpl.execute(FooDataStoreImpl.java:166)
        at com.example.impl.FooDataStoreImpl.resolveAndExecuteQuery(FooDataStoreImpl.java:149)
        at com.example.impl.FooDataStoreImpl.lambda$execute$0(FooDataStoreImpl.java:130)
        at com.example.impl.TimingLogger.time(TimingLogger.java:103)
        at com.example.impl.TimingLogger.debug(TimingLogger.java:56)
        at com.example.impl.TimingLogger.cqn(TimingLogger.java:64)
        at com.example.impl.FooDataStoreImpl.execute(FooDataStoreImpl.java:130)
        at com.example.services.impl.persistence.JdbcPersistenceService.lambda$defaultRead$1(JdbcPersistenceService.java:140)
        at com.example.services.impl.persistence.JdbcPersistenceService.checkExceptionAndOtelSpan(JdbcPersistenceService.java:203)
        at com.example.services.impl.persistence.JdbcPersistenceService.defaultRead(JdbcPersistenceService.java:140)
        at com.example.services.impl.handlerregistry.HandlerRegistryTools$DescribedHandler.process(HandlerRegistryTools.java:165)
        at com.example.services.impl.ServiceImpl.lambda$createOnHandlerChain$4(ServiceImpl.java:269)
        at com.example.services.impl.ServiceImpl.dispatch(ServiceImpl.java:236)
        ... 24 common frames omitted
Caused by: com.example.FooDataStoreException: SQL: SELECT NULLS FIRST
        ... 40 common frames omitted
Caused by: com.example.db.jdbc.exceptions.JDBCDriverException:  DBTech JDBC: [260]: invalid column name: T0.MY_VIEW_MY_VIEW_ID: line 1 col 382 (at pos 381)
        at com.example.db.jdbc.exceptions.SQLExceptionSapDB._newInstance(SQLExceptionSapDB.java:209)
        at com.example.db.jdbc.exceptions.SQLExceptionSapDB.newInstance(SQLExceptionSapDB.java:42)
        at com.example.db.jdbc.packet.HReplyPacket._buildExceptionChain(HReplyPacket.java:891)
        at com.example.db.jdbc.packet.HReplyPacket.getSQLExceptionChain(HReplyPacket.java:215)
        at com.example.db.jdbc.packet.HPartInfo.getSQLExceptionChain(HPartInfo.java:39)
        at com.example.db.jdbc.ConnectionSapDB._receive(ConnectionSapDB.java:5888)
        at com.example.db.jdbc.ConnectionSapDB.exchange(ConnectionSapDB.java:2708)
        at com.example.db.jdbc.PreparedStatementSapDB._prepare(PreparedStatementSapDB.java:3699)
        at com.example.db.jdbc.PreparedStatementSapDB._doParse(PreparedStatementSapDB.java:3582)
        at com.example.db.jdbc.PreparedStatementSapDB.<init>(PreparedStatementSapDB.java:170)
        at com.example.db.jdbc.PreparedStatementSapDB9.<init>(Unknown Source)
        at com.example.db.jdbc.HanaPreparedStatement.<init>(Unknown Source)
        at com.example.db.jdbc.HanaPreparedStatementClean.<init>(Unknown Source)
        at com.example.db.jdbc.HanaPreparedStatementClean.newInstance(Unknown Source)
        at com.example.db.jdbc.ConnectionSapDB9._prepareStatement(Unknown Source)
        at com.example.db.jdbc.ConnectionSapDB.prepareStatement(ConnectionSapDB.java:543)
        at com.zaxxer.hikari.pool.ProxyConnection.prepareStatement(ProxyConnection.java:328)
        at com.zaxxer.hikari.pool.HikariProxyConnection.prepareStatement(HikariProxyConnection.java)
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
        at java.base/java.lang.reflect.Method.invoke(Method.java:580)
        at org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy$TransactionAwareInvocationHandler.invoke(TransactionAwareDataSourceProxy.java:262)
        at jdk.proxy2/jdk.proxy2.$Proxy102.prepareStatement(Unknown Source)
        at com.example.impl.JDBCClient.lambda$executeQuery$2(JDBCClient.java:224)
        at com.example.impl.TimingLogger.time(TimingLogger.java:111)
        at com.example.impl.TimingLogger.sql(TimingLogger.java:90)
        at com.example.impl.JDBCClient.executeQuery(JDBCClient.java:222)
        at com.example.impl.JDBCClient.executeQuery(JDBCClient.java:196)
        ... 38 common frames omitted
\`\`\`
`
    }

    const cleanText =
        textRemoveCodeDelimiters(
            textTransformPaths(
                textTransformStacksAndWhitespace(
                    issueToText(
                          await issueAddCommentTexts(
                              issueTransformLabels(issue)
                          )
                    )
                )
            )
        )

    expect(cleanText).toEqual(`Something went wrong ### What happened?
We have a select query where we are trying to do a deep read into an association.
Here is the query.
CqnSelect select = Select.from(Foo.class)
.columns(daily -> daily._all(), daily -> daily.locations().expand())
.orderBy(getOrderBy(viewName));
Here are the entity files.
----------------------------------------------------------------------------------------------------------------------------
view FooView as select from Bar
{
key bla,
as bar
};
And the error says Invalid column BAR. We checked our view schema as well this column is not available in our schema. Not sure how the column name is getting generated like this.
<img width="452" alt="image" src="https://media.github.tools.example.com/bar">
### Steps to reproduce
Just a normal run will give this issue.
### Versions
| bar | <Add your repository here> |
|:---------------------- | ----------- |
|        | -- missing  |
| @bar/baz      | 4.5.0       |
### OS / Environment
Cloud Foundry
### Relevant log output
\`shell
com.example.services.impl.ContextualizedFooException: Error executing the statement (service 'PersistenceService$Default', event 'READ', entity 'PrivateDownloadService.fooDailyForDownload')
at com.example.services.impl.ServiceImpl.dispatch(ServiceImpl.java:256)
at com.example.services.impl.ServiceImpl.lambda$dispatchInChangeSetContext$2(ServiceImpl.java:203)
Caused by: com.example.FooDataStoreException: Error executing the statement
at com.example.impl.ExceptionHandler.dataStoreException(ExceptionHandler.java:62)
at com.example.impl.JDBCClient.executeQuery(JDBCClient.java:211)
Caused by: com.example.FooDataStoreException: SQL: SELECT NULLS FIRST
... 40 common frames omitted
Caused by: com.example.db.jdbc.exceptions.JDBCDriverException:  DBTech JDBC: [260]: invalid column name: T0.MY_VIEW_MY_VIEW_ID: line 1 col 382 (at pos 381)
at com.example.db.jdbc.exceptions.SQLExceptionSapDB._newInstance(SQLExceptionSapDB.java:209)
at com.example.db.jdbc.exceptions.SQLExceptionSapDB.newInstance(SQLExceptionSapDB.java:42)`
    )

  })
})
