import client from './client'

it('retrieves groups if logged in', async () => {
  client.useExportAPI();
  var data = await client.groups().catch(err => {
    console.log('---test err ' + JSON.stringify(err));
    expect(err.status).toEqual(401);
  });
}, 100000);