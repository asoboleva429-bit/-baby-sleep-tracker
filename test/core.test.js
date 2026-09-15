import test from 'node:test'; import assert from 'node:assert/strict';
import {sleepMinutes,periodStats,wakeWindows,correctedAgeMonths} from '../src/core.js';
test('вычитает ночные пробуждения',()=>assert.equal(sleepMinutes({start:'2026-01-01T20:00:00Z',end:'2026-01-01T22:00:00Z',awakenings:[{start:'2026-01-01T20:30:00Z',end:'2026-01-01T20:45:00Z'}]}),105));
test('распределяет сон через полночь',()=>{const e=[{start:'2026-01-01T23:00:00Z',end:'2026-01-02T02:00:00Z',sleepType:'night'}]; assert.equal(periodStats(e,new Date('2026-01-02T00:00:00Z'),new Date('2026-01-03T00:00:00Z')).total,120)});
test('считает окна бодрствования',()=>assert.deepEqual(wakeWindows([{start:'2026-01-01T08:00Z',end:'2026-01-01T09:00Z'},{start:'2026-01-01T11:00Z',end:'2026-01-01T12:00Z'}],new Date('2026-01-01T13:00Z').getTime()),[120,60]));
test('учитывает скорректированный возраст',()=>{const age=correctedAgeMonths({birthDate:'2026-01-01',expectedDate:'2026-02-01'},new Date('2026-03-01')); assert.ok(age>0.8&&age<1.1)});
