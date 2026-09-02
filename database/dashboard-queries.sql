-- Inspecoes concluidas em um periodo
select count(*) as completed_inspections
from inspection_runs
where status in ('submitted', 'approved')
  and submitted_at >= $1
  and submitted_at < $2;

-- Taxa de nao conformidade por execucao de inspecao
select
  count(distinct nc.id)::numeric
  / nullif(count(distinct ir.id), 0) as non_conformity_rate
from inspection_runs ir
left join non_conformities nc on nc.inspection_run_id = ir.id
where ir.submitted_at >= $1
  and ir.submitted_at < $2;

-- Tecnicos com atividades em andamento
select count(distinct assigned_to_user_id) as active_field_technicians
from inspection_assignments
where status = 'in_progress';

-- Inspecoes atrasadas
select count(*) as late_inspections
from inspection_assignments
where status in ('scheduled', 'in_progress', 'late')
  and due_at < now();

-- Nao conformidades abertas para o card do dashboard
select
  nc.id,
  s.name as site_name,
  e.name as equipment_name,
  nc.severity,
  nc.status,
  nc.opened_at
from non_conformities nc
join equipment e on e.id = nc.equipment_id
join sites s on s.id = e.site_id
where nc.status in ('open', 'in_progress')
order by
  case nc.severity
    when 'critical' then 1
    when 'high' then 2
    when 'medium' then 3
    when 'low' then 4
  end,
  nc.opened_at desc
limit 20;

-- Acoes rapidas: tarefas pendentes ou atrasadas
select
  ca.id,
  ca.title,
  ca.status,
  ca.due_at,
  nc.severity,
  e.name as equipment_name,
  s.name as site_name
from corrective_actions ca
join non_conformities nc on nc.id = ca.non_conformity_id
join equipment e on e.id = nc.equipment_id
join sites s on s.id = e.site_id
where ca.status in ('open', 'in_progress')
order by
  case when ca.due_at < now() then 0 else 1 end,
  ca.due_at nulls last,
  nc.severity desc
limit 10;

