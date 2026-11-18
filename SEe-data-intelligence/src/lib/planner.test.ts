import { describe, expect, it } from 'vitest';
import { planQuestion, validateReadOnlySql } from './planner';
const cols=[{name:'product',type:'VARCHAR'},{name:'revenue',type:'DOUBLE'},{name:'order_date',type:'TIMESTAMP'}];
describe('question planner',()=>{
 it('builds grouped top-N query',()=>expect(planQuestion('top 5 products by revenue','uploaded_data',cols).sql).toContain('LIMIT 5'));
 it('counts rows',()=>expect(planQuestion('how many rows?','uploaded_data',cols).sql).toContain('COUNT(*)'));
 it('builds monthly trend query',()=>expect(planQuestion('show monthly trend','uploaded_data',cols).sql).toContain("DATE_TRUNC('month'"));
});
describe('read-only SQL guard',()=>{
 it('allows a SELECT on active table',()=>expect(validateReadOnlySql('SELECT * FROM "uploaded_data"','uploaded_data')).toMatch(/^SELECT/));
 it('blocks destructive statements',()=>expect(()=>validateReadOnlySql('DROP TABLE uploaded_data','uploaded_data')).toThrow());
 it('blocks multi statements',()=>expect(()=>validateReadOnlySql('SELECT 1; SELECT 2','uploaded_data')).toThrow());
});
