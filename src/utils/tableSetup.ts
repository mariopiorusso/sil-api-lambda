import * as AWS from 'aws-sdk';
import * as ddbGeo from 'dynamodb-geo';
import { GEO_HASHKEY_LENGTH, TABLE } from './constants';

const ddb = new AWS.DynamoDB();

const createGeoTable = async (tableName: string, gsiName: string, hashKey: string, rangeKey?: string) => {
  const config = new ddbGeo.GeoDataManagerConfiguration(ddb, tableName);
  config.hashKeyLength = GEO_HASHKEY_LENGTH;

  const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(config);

  // Set BillingMode to PAY_PER_REQUEST for on-demand provisioning
  createTableInput.BillingMode = 'PAY_PER_REQUEST';

  // Add GSI for ID-based lookups
  createTableInput.GlobalSecondaryIndexes = [
    {
      IndexName: gsiName,
      KeySchema: [
        { AttributeName: hashKey, KeyType: 'HASH' },
        ...(rangeKey ? [{ AttributeName: rangeKey, KeyType: 'RANGE' }] : [])
      ],
      Projection: {
        ProjectionType: 'ALL'
      }
    }
  ];

  createTableInput.AttributeDefinitions.push(
    { AttributeName: hashKey, AttributeType: 'S' },
    ...(rangeKey ? [{ AttributeName: rangeKey, AttributeType: 'S' }] : [])
  );

  console.log(`Creating table ${tableName} with schema:`);
  console.dir(createTableInput, { depth: null });

  await ddb.createTable(createTableInput).promise();
  console.log(`Table ${tableName} created successfully`);
};

const createTable = async (tableName: string, hashKey: string, rangeKey?: string, gsis?: AWS.DynamoDB.GlobalSecondaryIndex[]) => {
  const params: AWS.DynamoDB.CreateTableInput = {
    TableName: tableName,
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [
      { AttributeName: hashKey, KeyType: 'HASH' },
      ...(rangeKey ? [{ AttributeName: rangeKey, KeyType: 'RANGE' }] : [])
    ],
    AttributeDefinitions: [
      { AttributeName: hashKey, AttributeType: 'S' },
      ...(rangeKey ? [{ AttributeName: rangeKey, AttributeType: 'S' }] : [])
    ],
    GlobalSecondaryIndexes: gsis
  };

  console.log(`Creating table ${tableName} with schema:`);
  console.dir(params, { depth: null });

  await ddb.createTable(params).promise();
  console.log(`Table ${tableName} created successfully`);
};

const setupTables = async () => {
  await createGeoTable(TABLE.Events, 'EventIdGSI', 'eventId', 'entityType');
  await createGeoTable(TABLE.Teams, 'TeamIdGSI', 'teamId', 'entityType');
  await createGeoTable(TABLE.Users, 'UserIdGSI', 'userId');

  await createTable(TABLE.Messages, 'messageId', 'eventId', [
    {
      IndexName: 'EventMessagesGSI',
      KeySchema: [
        { AttributeName: 'eventId', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      }
    }
  ]);
  await createTable(TABLE.Buddies, 'userId', 'buddyId');
  await createTable(TABLE.BuddyMessages, 'messageId', 'buddyId');
};

setupTables().catch((error) => console.error(error));
