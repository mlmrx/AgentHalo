import test from 'node:test'; import assert from 'node:assert/strict';
import { processAgentRequest } from '../src/runtime/haloRuntime.js';
import { HaloDelegation } from '../src/delegation/haloDelegation.js';
import { HaloRegistry } from '../src/registry/haloRegistry.js';

test('denied consent blocks execution',()=>{ assert.throws(()=>processAgentRequest({userId:'user-001',prompt:'medical help',consentDecisions:{approximate_location:false}})); });
test('local-only task does not call external',()=>{ const out=processAgentRequest({userId:'user-001',prompt:'Can I afford this $1,200 purchase this month?'}); assert.equal(out.result?.affordable,true); assert.deepEqual(out.dataShared,[]); });
test('revoked grants are rejected',()=>{ const g=HaloDelegation.grant({subject:'user-001',audience:'svc.health.verified.camp',purpose:'find_nearest_care',scope:['share:approximate_location']}); HaloDelegation.revoke({grantId:g.grantId}); assert.equal(HaloDelegation.verify({grantId:g.grantId}),false); });
test('unverified services are blocked',()=>{ const s=HaloRegistry.get('svc.health.verified.camp'); s.trust.status='revoked'; assert.equal(HaloRegistry.verify(s),false); s.trust.status='verified'; });
