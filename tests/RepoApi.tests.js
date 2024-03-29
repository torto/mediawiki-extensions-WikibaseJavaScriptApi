/**
 * @licence GNU GPL v2+
 * @author H. Snater < mediawiki@snater.com >
 */
( function( mw, wb, QUnit, sinon ) {
	'use strict';

QUnit.module( 'wikibase.api.RepoApi' );

/**
 * Instantiates a `wikibase.api.RepoApi` object with the relevant method being overwritten and
 * having applied a SinonJS spy.
 *
 * @param {string} [getOrPost='post'] Whether to mock/spy the `get` or `post` request.
 * @return {Object}
 */
function mockApi( getOrPost ) {
	var api = new mw.Api(),
		spyMethod = getOrPost !== 'get' ? 'postWithToken' : 'get';

	api.postWithToken = function() {};
	api.get = function() {};

	return {
		spy: sinon.spy( api, spyMethod ),
		api: new wb.api.RepoApi( api )
	};
}

/**
 * Returns all request parameters submitted to the function performing the `get` or `post` request.
 *
 * @param {Object} spy The SinonJS spy to extract the parameters from.
 * @param [callIndex=0] The call index if multiple API calls have been performed on the same spy.
 * @return {Object}
 */
function getParams( spy, callIndex ) {
	callIndex = callIndex || 0;
	return spy.displayName === 'postWithToken' ? spy.args[callIndex][1] : spy.args[callIndex][0];
}

/**
 * Returns a specific parameter submitted to the function performing the `get` or `post` request.
 *
 * @param {Object} spy The SinonJS spy to extract the parameters from.
 * @param {string} paramName
 * @param [callIndex=0] The call index if multiple API calls have been performed on the same spy.
 * @return {string}
 */
function getParam( spy, paramName, callIndex ) {
	return getParams( spy, callIndex || 0 )[paramName];
}

QUnit.test( 'createEntity()', function( assert ) {
	assert.expect( 5 );
	var mock = mockApi();

	mock.api.createEntity( 'item' );
	mock.api.createEntity( 'property', { 'I am': 'data' } );

	assert.ok( mock.spy.calledTwice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbeditentity',
		'Verified API module being called.'
	);

	assert.equal(
		getParam( mock.spy, 'new' ),
		'item',
		'Verified submitting entity type.'
	);

	assert.equal(
		getParam( mock.spy, 'data' ),
		JSON.stringify( {} ),
		'Verified not submitting any data by default.'
	);

	assert.equal(
		getParam( mock.spy, 'data', 1 ),
		JSON.stringify( { 'I am': 'data' } ),
		'Verified submitting "data" field.'
	);
} );

QUnit.test( 'editEntity()', function( assert ) {
	assert.expect( 6 );
	var mock = mockApi();

	mock.api.editEntity( 'entity id', 12345, { 'I am': 'entity data' }, true );

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbeditentity',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'id' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'data' ), JSON.stringify( { 'I am': 'entity data' } ) );
	assert.equal( getParam( mock.spy, 'clear' ), true );
} );

QUnit.test( 'formatValue()', function( assert ) {
	assert.expect( 10 );
	var mock = mockApi( 'get' );

	mock.api.formatValue(
		{ 'I am': 'DataValue serialization' },
		{ option: 'option value' },
		'data type id',
		'output format'
	);
	mock.api.formatValue( { 'I am': 'DataValue serialization' } );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbformatvalue',
		'Verified API module being called.'
	);

	assert.equal(
		getParam( mock.spy, 'datavalue' ),
		JSON.stringify( { 'I am': 'DataValue serialization' } )
	);
	assert.equal( getParam( mock.spy, 'options' ), JSON.stringify( { option: 'option value' } ) );
	assert.equal( getParam( mock.spy, 'datatype' ), 'data type id' );
	assert.equal( getParam( mock.spy, 'generate' ), 'output format' );

	assert.equal(
		getParam( mock.spy, 'datavalue', 1 ),
		JSON.stringify( { 'I am': 'DataValue serialization' } )
	);
	assert.equal( getParam( mock.spy, 'options', 1 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'datatype', 1 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'generate', 1 ), undefined );
} );

QUnit.test( 'getEntities()', function( assert ) {
	assert.expect( 17 );
	var mock = mockApi( 'get' );

	mock.api.getEntities(
		['entity id 1', 'entity id 2'],
		['property1', 'property2'],
		['language code 1', 'language code 2'],
		['sort property 1', 'sort property 2'],
		'ascending'
	);

	mock.api.getEntities(
		'entity id',
		'property',
		'language code',
		'sort property',
		'descending'
	);

	mock.api.getEntities( 'entity id' );

	assert.ok( mock.spy.calledThrice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbgetentities',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'ids' ), 'entity id 1|entity id 2' );
	assert.equal( getParam( mock.spy, 'props' ), 'property1|property2' );
	assert.equal( getParam( mock.spy, 'languages' ), 'language code 1|language code 2' );
	assert.equal( getParam( mock.spy, 'sort' ), 'sort property 1|sort property 2' );
	assert.equal( getParam( mock.spy, 'dir' ), 'ascending' );

	assert.equal( getParam( mock.spy, 'ids', 1 ), 'entity id' );
	assert.equal( getParam( mock.spy, 'props', 1 ), 'property' );
	assert.equal( getParam( mock.spy, 'languages', 1 ), 'language code' );
	assert.equal( getParam( mock.spy, 'sort', 1 ), 'sort property' );
	assert.equal( getParam( mock.spy, 'dir', 1 ), 'descending' );

	assert.equal( getParam( mock.spy, 'ids', 2 ), 'entity id' );
	assert.strictEqual( getParam( mock.spy, 'props', 2 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'languages', 2 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'sort', 2 ), undefined );
	assert.equal( getParam( mock.spy, 'dir', 2 ), 'ascending' );
} );

QUnit.test( 'getEntitiesByPage()', function( assert ) {
	assert.expect( 44 );
	var mock = mockApi( 'get' );

	mock.api.getEntitiesByPage(
		['site id 1', 'site id 2'],
		'title',
		['property1', 'property2'],
		['language code 1', 'language code 2'],
		['sort property 1', 'sort property 2'],
		'ascending',
		true
	);

	mock.api.getEntitiesByPage(
		'site id',
		['title1', 'title2'],
		['property1', 'property2'],
		['language code 1', 'language code 2'],
		['sort property 1', 'sort property 2'],
		'ascending',
		true
	);

	mock.api.getEntitiesByPage(
		'site id',
		'title',
		'property',
		'language code',
		'sort property',
		'descending',
		false
	);

	mock.api.getEntitiesByPage( 'site id', 'title' );
	mock.api.getEntitiesByPage( ['site id'], 'title' );
	mock.api.getEntitiesByPage( 'site id', ['title'] );

	assert.equal( mock.spy.callCount, 6, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbgetentities',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'sites' ), 'site id 1|site id 2' );
	assert.equal( getParam( mock.spy, 'titles' ), 'title' );
	assert.equal( getParam( mock.spy, 'props' ), 'property1|property2' );
	assert.equal( getParam( mock.spy, 'languages' ), 'language code 1|language code 2' );
	assert.equal( getParam( mock.spy, 'sort' ), 'sort property 1|sort property 2' );
	assert.equal( getParam( mock.spy, 'dir' ), 'ascending' );
	assert.strictEqual( getParam( mock.spy, 'normalize' ), true );

	assert.equal( getParam( mock.spy, 'sites', 1 ), 'site id' );
	assert.equal( getParam( mock.spy, 'titles', 1 ), 'title1|title2' );
	assert.equal( getParam( mock.spy, 'props', 1 ), 'property1|property2' );
	assert.equal( getParam( mock.spy, 'languages' ), 'language code 1|language code 2' );
	assert.equal( getParam( mock.spy, 'sort' ), 'sort property 1|sort property 2' );
	assert.equal( getParam( mock.spy, 'dir', 1 ), 'ascending' );
	assert.strictEqual( getParam( mock.spy, 'normalize', 1 ), true );

	assert.equal( getParam( mock.spy, 'sites', 2 ), 'site id' );
	assert.equal( getParam( mock.spy, 'titles', 2 ), 'title' );
	assert.equal( getParam( mock.spy, 'props', 2 ), 'property' );
	assert.equal( getParam( mock.spy, 'languages', 2 ), 'language code' );
	assert.equal( getParam( mock.spy, 'sort', 2 ), 'sort property' );
	assert.equal( getParam( mock.spy, 'dir', 2 ), 'descending' );
	assert.strictEqual( getParam( mock.spy, 'normalize', 2 ), false );

	assert.equal( getParam( mock.spy, 'sites', 3 ), 'site id' );
	assert.equal( getParam( mock.spy, 'titles', 3 ), 'title' );
	assert.strictEqual( getParam( mock.spy, 'props', 3 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'languages', 3 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'sort', 3 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'dir', 3 ), 'ascending' );
	assert.strictEqual( getParam( mock.spy, 'normalize', 3 ), undefined );

	assert.equal( getParam( mock.spy, 'sites', 4 ), 'site id' );
	assert.equal( getParam( mock.spy, 'titles', 4 ), 'title' );
	assert.strictEqual( getParam( mock.spy, 'props', 4 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'languages', 4 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'sort', 4 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'dir', 4 ), 'ascending' );
	assert.strictEqual( getParam( mock.spy, 'normalize', 4 ), undefined );

	assert.equal( getParam( mock.spy, 'sites', 5 ), 'site id' );
	assert.equal( getParam( mock.spy, 'titles', 5 ), 'title' );
	assert.strictEqual( getParam( mock.spy, 'props', 5 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'languages', 5 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'sort', 5 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'dir', 5 ), 'ascending' );
	assert.strictEqual( getParam( mock.spy, 'normalize', 5 ), undefined );
} );

QUnit.test( 'parseValue()', function( assert ) {
	assert.expect( 8 );
	var mock = mockApi( 'get' );

	mock.api.parseValue(
		'parser id',
		['serialization1', 'serialization2'],
		{ option: 'option value'}
	);
	mock.api.parseValue( 'parser id', ['serialization'] );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbparsevalue',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'parser' ), 'parser id' );
	assert.equal( getParam( mock.spy, 'values' ), 'serialization1|serialization2');
	assert.equal( getParam( mock.spy, 'options' ), JSON.stringify( { option: 'option value'} ) );

	assert.equal( getParam( mock.spy, 'parser', 1 ), 'parser id' );
	assert.equal( getParam( mock.spy, 'values', 1 ), 'serialization');
	assert.strictEqual( getParam( mock.spy, 'options', 1 ), undefined );
} );

QUnit.test( 'searchEntities()', function( assert ) {
	assert.expect( 12 );
	var mock = mockApi( 'get' );

	mock.api.searchEntities( 'label', 'language code', 'entity type', 10, 5 );
	mock.api.searchEntities( 'label', 'language code', 'entity type' );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsearchentities',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'search' ), 'label' );
	assert.equal( getParam( mock.spy, 'language' ), 'language code' );
	assert.equal( getParam( mock.spy, 'type' ), 'entity type' );
	assert.equal( getParam( mock.spy, 'limit' ), 10 );
	assert.equal( getParam( mock.spy, 'continue' ), 5 );

	assert.equal( getParam( mock.spy, 'search', 1 ), 'label' );
	assert.equal( getParam( mock.spy, 'language', 1 ), 'language code' );
	assert.equal( getParam( mock.spy, 'type', 1 ), 'entity type' );
	assert.strictEqual( getParam( mock.spy, 'limit', 1 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'continue', 1 ), undefined );
} );

QUnit.test( 'setLabel(), setDescription()', function( assert ) {
	assert.expect( 12 );
	var subjects = ['Label', 'Description'];

	for( var i = 0; i < subjects.length; i++ ) {
		var mock = mockApi();

		mock.api['set' + subjects[i]]( 'entity id', 12345, 'text', 'language code' );

		assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

		assert.equal(
			getParam( mock.spy, 'action' ),
			'wbset' + subjects[i].toLowerCase(),
			'Verified API module being called.'
		);

		assert.equal( getParam( mock.spy, 'id' ), 'entity id' );
		assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
		assert.equal( getParam( mock.spy, 'value' ), 'text' );
		assert.equal( getParam( mock.spy, 'language' ), 'language code' );
	}
} );

QUnit.test( 'setAliases()', function( assert ) {
	assert.expect( 7 );
	var mock = mockApi();

	mock.api.setAliases(
		'entity id', 12345, ['alias1', 'alias2'], ['alias-remove'], 'language code'
	);

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetaliases',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'id' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'add' ), 'alias1|alias2' );
	assert.equal( getParam( mock.spy, 'remove' ), 'alias-remove' );
	assert.equal( getParam( mock.spy, 'language' ), ['language code'] );
} );

QUnit.test( 'setClaim()', function( assert ) {
	assert.expect( 8 );
	var mock = mockApi();

	mock.api.setClaim( { 'I am': 'a Claim serialization' }, 12345, 67890 );
	mock.api.setClaim( { 'I am': 'a Claim serialization' }, 12345 );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetclaim',
		'Verified API module being called.'
	);

	assert.equal(
		getParam( mock.spy, 'claim' ),
		JSON.stringify( { 'I am': 'a Claim serialization' } )
	);
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'index' ), 67890 );

	assert.equal(
		getParam( mock.spy, 'claim', 1 ),
		JSON.stringify( { 'I am': 'a Claim serialization' } )
	);
	assert.equal( getParam( mock.spy, 'baserevid', 1 ), 12345 );
	assert.strictEqual( getParam( mock.spy, 'index', 1 ), undefined );
} );

QUnit.test( 'createClaim()', function( assert ) {
	assert.expect( 12 );
	var mock = mockApi();

	mock.api.createClaim( 'entity id', 12345, 'snak type', 'property id', 'snak value' );
	mock.api.createClaim( 'entity id', 12345, 'snak type', 'property id' );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbcreateclaim',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'entity' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'snaktype' ), 'snak type' );
	assert.equal( getParam( mock.spy, 'property' ), 'property id' );
	assert.equal( getParam( mock.spy, 'value' ), JSON.stringify( 'snak value' ) );

	assert.equal( getParam( mock.spy, 'entity', 1 ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid', 1 ), 12345 );
	assert.equal( getParam( mock.spy, 'snaktype', 1 ), 'snak type' );
	assert.equal( getParam( mock.spy, 'property', 1 ), 'property id' );
	assert.strictEqual( getParam( mock.spy, 'value', 1 ), undefined );
} );

QUnit.test( 'removeClaim()', function( assert ) {
	assert.expect( 6 );
	var mock = mockApi();

	mock.api.removeClaim( 'claim GUID', 12345 );
	mock.api.removeClaim( 'claim GUID' );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbremoveclaims',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'claim' ), 'claim GUID' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );

	assert.equal( getParam( mock.spy, 'claim', 1 ), 'claim GUID' );
	assert.strictEqual( getParam( mock.spy, 'baserevid', 1 ), undefined );
} );

QUnit.test( 'getClaims()', function( assert ) {
	assert.expect( 12 );
	var mock = mockApi( 'get' );

	mock.api.getClaims( 'entity id', 'property id', 'claim GUID', 'rank', 'claim props' );
	mock.api.getClaims( 'entity id' );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbgetclaims',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'entity' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'property' ), 'property id' );
	assert.equal( getParam( mock.spy, 'claim' ), 'claim GUID' );
	assert.equal( getParam( mock.spy, 'rank' ), 'rank' );
	assert.equal( getParam( mock.spy, 'props' ), 'claim props' );

	assert.equal( getParam( mock.spy, 'entity', 1 ), 'entity id' );
	assert.strictEqual( getParam( mock.spy, 'property', 1 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'claim', 1 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'rank', 1 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'props', 1 ), undefined );
} );

QUnit.test( 'setClaimValue()', function( assert ) {
	assert.expect( 12 );
	var mock = mockApi();

	mock.api.setClaimValue( 'claim GUID', 12345, 'snak type', 'property id', 'snak value' );
	mock.api.setClaimValue( 'claim GUID', 12345, 'snak type', 'property id' );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetclaimvalue',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'claim' ), 'claim GUID' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'snaktype' ), 'snak type' );
	assert.equal( getParam( mock.spy, 'property' ), 'property id' );
	assert.equal( getParam( mock.spy, 'value' ), JSON.stringify( 'snak value' ) );

	assert.equal( getParam( mock.spy, 'claim', 1 ), 'claim GUID' );
	assert.equal( getParam( mock.spy, 'baserevid', 1 ), 12345 );
	assert.equal( getParam( mock.spy, 'snaktype', 1 ), 'snak type' );
	assert.equal( getParam( mock.spy, 'property', 1 ), 'property id' );
	assert.strictEqual( getParam( mock.spy, 'value', 1 ), undefined );
} );

QUnit.test( 'setReference()', function( assert ) {
	assert.expect( 12 );
	var mock = mockApi();

	mock.api.setReference(
		'statement GUID',
		{'I am': 'serialized Snaks'},
		12345,
		'reference hash',
		67890
	);
	mock.api.setReference( 'statement GUID', {'I am': 'serialized Snaks'}, 12345 );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetreference',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'statement' ), 'statement GUID' );
	assert.equal( getParam( mock.spy, 'snaks' ), JSON.stringify( {'I am': 'serialized Snaks'} ) );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'reference' ), 'reference hash' );
	assert.equal( getParam( mock.spy, 'index' ), 67890 );

	assert.equal( getParam( mock.spy, 'statement', 1 ), 'statement GUID' );
	assert.equal(
		getParam( mock.spy, 'snaks', 1 ),
		JSON.stringify( {'I am': 'serialized Snaks'} )
	);
	assert.equal( getParam( mock.spy, 'baserevid', 1 ), 12345 );
	assert.strictEqual( getParam( mock.spy, 'reference', 1 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'index', 1 ), undefined );
} );

QUnit.test( 'removeReferences()', function( assert ) {
	assert.expect( 8 );
	var mock = mockApi();

	mock.api.removeReferences( 'statement GUID', ['reference hash 1', 'reference hash 2'], 12345 );
	mock.api.removeReferences( 'statement GUID', 'reference hash', 12345 );

	assert.ok( mock.spy.calledTwice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbremovereferences',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'statement' ), 'statement GUID' );
	assert.equal( getParam( mock.spy, 'references' ), 'reference hash 1|reference hash 2' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );

	assert.equal( getParam( mock.spy, 'statement', 1 ), 'statement GUID' );
	assert.equal( getParam( mock.spy, 'references', 1 ), 'reference hash' );
	assert.equal( getParam( mock.spy, 'baserevid', 1 ), 12345 );
} );

QUnit.test( 'setSitelink()', function( assert ) {
	assert.expect( 12 );
	var mock = mockApi();

	mock.api.setSitelink(
		'entity id', 12345, 'site id', 'page name', ['entity id of badge1', 'entity id of badge 2']
	);
	mock.api.setSitelink( 'entity id', 12345, 'site id', 'page name' );

	assert.ok( mock.spy.calledTwice, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetsitelink',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'id' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'linksite' ), 'site id' );
	assert.equal( getParam( mock.spy, 'linktitle' ), 'page name' );
	assert.equal( getParam( mock.spy, 'badges' ), 'entity id of badge1|entity id of badge 2' );

	assert.equal( getParam( mock.spy, 'id', 1 ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid', 1 ), 12345 );
	assert.equal( getParam( mock.spy, 'linksite', 1 ), 'site id' );
	assert.equal( getParam( mock.spy, 'linktitle', 1 ), 'page name' );
	assert.strictEqual( getParam( mock.spy, 'badges', 1 ), undefined );
} );

QUnit.test( 'mergeItems()', function( assert ) {
	assert.expect( 14 );
	var mock = mockApi();

	mock.api.mergeItems(
		'entity id from',
		'entity id to',
		['property to ignore conflict for 1', 'property to ignore conflict for 2'],
		'edit summary'
	);
	mock.api.mergeItems(
		'entity id from',
		'entity id to',
		'property to ignore conflict for',
		'edit summary'
	);
	mock.api.mergeItems( 'entity id from', 'entity id to' );

	assert.ok( mock.spy.calledThrice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbmergeitems',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'fromid' ), 'entity id from' );
	assert.equal( getParam( mock.spy, 'toid' ), 'entity id to' );
	assert.equal(
		getParam( mock.spy, 'ignoreconflicts' ),
		'property to ignore conflict for 1|property to ignore conflict for 2'
	);
	assert.equal( getParam( mock.spy, 'summary' ), 'edit summary' );

	assert.equal( getParam( mock.spy, 'fromid', 1 ), 'entity id from' );
	assert.equal( getParam( mock.spy, 'toid', 1 ), 'entity id to' );
	assert.equal(
		getParam( mock.spy, 'ignoreconflicts', 1 ),
		'property to ignore conflict for'
	);
	assert.equal( getParam( mock.spy, 'summary', 1 ), 'edit summary' );

	assert.equal( getParam( mock.spy, 'fromid', 2 ), 'entity id from' );
	assert.equal( getParam( mock.spy, 'toid', 2 ), 'entity id to' );
	assert.strictEqual( getParam( mock.spy, 'ignoreconflicts', 2 ), undefined );
	assert.strictEqual( getParam( mock.spy, 'summary', 2 ), undefined );
} );

}( mediaWiki, wikibase, QUnit, sinon ) );
