import * as THREE from 'three';
// Shared by Companion, Learn and Phone. Front is -Y, up is +Z.
export function applyRobotDance(nodes,base,u,weight){
 const phase=u*Math.PI*4,swing=Math.sin(phase),e=weight,root=nodes.get('CTRL_Bip');
 root.position.x+=.065*swing*e;
 nodes.get('CTRL_body').rotateZ(-.055*swing*e);
 nodes.get('CTRL_head').rotateX(-.025*e).rotateZ(.045*swing*e);
 for(const side of ['-1','1']){
  const blend=Math.min(1,e*8);
  const n=Number(side),arm=nodes.get('CTRL_arm_'+side),elbow=nodes.get('CTRL_elbow_'+side),wrist=nodes.get('CTRL_wrist_'+side);
  const inward=Math.max(0,-n*swing);
  // Retreat around the outside of the torso before crossing the front.
  const target=new THREE.Vector3(n*(.71+.11*e-.36*inward*inward*e),(-.09+.41*n*swing)*e-.02*(1-e),.79+.33*e);
  const shoulder=base.get(arm.name).p.clone(),upper=base.get(elbow.name).p.clone(),lower=base.get(wrist.name).p.clone();
  const l1=upper.length(),l2=lower.length(),delta=target.clone().sub(shoulder);
  const distance=Math.min(l1+l2-.002,Math.max(Math.abs(l1-l2)+.002,delta.length())),axis=delta.normalize();
  target.copy(shoulder).addScaledVector(axis,distance);
  const along=(l1*l1-l2*l2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,l1*l1-along*along));
  const pole=new THREE.Vector3(n,0,0).addScaledVector(axis,-n*axis.x).normalize();
  const bend=shoulder.clone().addScaledVector(axis,along).addScaledVector(pole,height);
  const aq=new THREE.Quaternion().setFromUnitVectors(upper.clone().normalize(),bend.clone().sub(shoulder).normalize());
  arm.quaternion.copy(aq);
  const local=target.clone().sub(bend).applyQuaternion(aq.clone().invert()).normalize();
  elbow.quaternion.setFromUnitVectors(lower.clone().normalize(),local);
  // Keep the grippers vertical; they do not twist through the chest.
  wrist.quaternion.copy(aq.clone().multiply(elbow.quaternion).invert());
  arm.quaternion.slerpQuaternions(base.get(arm.name).q,arm.quaternion.clone(),blend);
  elbow.quaternion.slerpQuaternions(base.get(elbow.name).q,elbow.quaternion.clone(),blend);
  wrist.quaternion.slerpQuaternions(base.get(wrist.name).q,wrist.quaternion.clone(),blend);
  nodes.get('CTRL_antenna_'+side).rotateX(.12*Math.sin(phase-.35+n*.2)*e).rotateZ(.10*swing*e);
 }
}
