import * as AWS from 'aws-sdk';
import * as ddbGeo from 'dynamodb-geo';
import { GEO_HASHKEY_LENGTH, TABLE } from './constants';

// Set the AWS region
AWS.config.update({ region: 'eu-west-1' });

// Initialize the DynamoDB service object
const ddb = new AWS.DynamoDB();

// Function to create a geospatial table
const createGeoTable = async (tableName: string, gsiName: string, hashKey: string, rangeKey?: string) => {
  if (await tableExists(tableName)) {
    console.log(`Table ${tableName} already exists, skipping creation.`);
    return;
  }
  // Configure the GeoDataManager
  const config = new ddbGeo.GeoDataManagerConfiguration(ddb, tableName);
  config.hashKeyLength = GEO_HASHKEY_LENGTH;

  // Get the create table request for the geospatial table
  const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(config);

  // Set BillingMode to PAY_PER_REQUEST for on-demand provisioning
  createTableInput.BillingMode = 'PAY_PER_REQUEST';

  // Remove ReadCapacityUnits and WriteCapacityUnits from the request
  delete createTableInput.ProvisionedThroughput;

  // Add a Global Secondary Index (GSI) for ID-based lookups
  createTableInput.GlobalSecondaryIndexes = [
    {
      IndexName: gsiName,
      KeySchema: [
        { AttributeName: hashKey, KeyType: 'HASH' },
        ...(rangeKey ? [{ AttributeName: rangeKey, KeyType: 'RANGE' }] : [])
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
    }
  ];

  // Add attribute definitions for the hash and range keys
  createTableInput.AttributeDefinitions.push(
    { AttributeName: hashKey, AttributeType: 'S' },
    ...(rangeKey ? [{ AttributeName: rangeKey, AttributeType: 'S' }] : [])
  );

  // Log the table creation schema
  console.log(`Creating table ${tableName} with schema:`);
  console.dir(createTableInput, { depth: null });

  // Create the table
  await ddb.createTable(createTableInput).promise();
  console.log(`Table ${tableName} created successfully`);
};

// Function to create a regular table with optional GSIs
const createTable = async (tableName: string, hashKey: string, rangeKey?: string, gsis?: AWS.DynamoDB.GlobalSecondaryIndex[]) => {
  if (await tableExists(tableName)) {
    console.log(`Table ${tableName} already exists, skipping creation.`);
    return;
  }
  // Define the parameters for the create table request
  const params: AWS.DynamoDB.CreateTableInput = {
    TableName: tableName,
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [
      { AttributeName: hashKey, KeyType: 'HASH' },
      ...(rangeKey ? [{ AttributeName: rangeKey, KeyType: 'RANGE' }] : [])
    ],
    AttributeDefinitions: [
      { AttributeName: hashKey, AttributeType: 'S' },
      ...(rangeKey ? [{ AttributeName: rangeKey, AttributeType: 'S' }] : []),
      ...(gsis ? gsis.flatMap(gsi => gsi.KeySchema.map(key => ({
        AttributeName: key.AttributeName,
        AttributeType: 'S'
      }))) : [])
    ],
    GlobalSecondaryIndexes: gsis?.map(gsi => ({
      ...gsi,
    }))
  };

  // Ensure unique attribute definitions
  params.AttributeDefinitions = Array.from(new Set(params.AttributeDefinitions.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));

  // Log the table creation schema
  console.log(`Creating table ${tableName} with schema:`);
  console.dir(params, { depth: null });

  // Create the table
  await ddb.createTable(params).promise();
  console.log(`Table ${tableName} created successfully`);
};

// Function to setup all required tables
const setupTables = async () => {
  // Create geospatial tables
  await createGeoTable(TABLE.Events, 'EventIdGSI', 'eventId', 'entityType');
  await createGeoTable(TABLE.Teams, 'TeamIdGSI', 'teamId', 'entityType');
  await createGeoTable(TABLE.Users, 'UserIdGSI', 'userId');

  // Create regular tables with optional GSIs
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

const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    await ddb.describeTable({ TableName: tableName }).promise();
    return true;
  } catch (error) {
    return false;
  }
};

// Run the setupTables function
setupTables().catch(error => {
  console.error('Error setting up tables:', error);
});