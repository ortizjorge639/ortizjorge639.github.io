import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { projects } from '../src/projects.ts';
import { projectStories } from '../src/stories.ts';

const beats = ['need', 'approach', 'flow', 'build', 'details', 'use'];
const beatVisuals = {
  need: ['contrast'],
  approach: ['image', 'steps', 'outcome'],
  flow: ['flow'],
  build: ['roles'],
  details: ['steps'],
  use: ['outcome'],
};
const idPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const imagePattern = /^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g|avif|svg)$/;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function isSourceUrl(value, approvedRepos) {
  if (typeof value !== 'string') return false;
  if (/^https:\/\/ortizjorge639\.github\.io\/(?:#[a-zA-Z0-9/_-]+)?$/.test(value)) return true;
  const match = /^https:\/\/github\.com\/ortizjorge639\/([a-z0-9-]+)\/blob\/([a-f0-9]{40})\/([a-zA-Z0-9._/-]+)(?:#[a-zA-Z0-9_-]+)?$/.exec(value);
  return Boolean(match && approvedRepos.has(match[1])
    && match[3].split('/').every(part => part && part !== '.' && part !== '..'));
}

/** Validate authored data without repairing it or inferring missing content. */
export function validateStories(stories, catalog) {
  const errors = [];
  const error = (path, message) => errors.push(`${path}: ${message}`);
  const object = (value, path, fields) => {
    if (!isRecord(value)) {
      error(path, 'must be an object');
      return false;
    }
    for (const key of Object.keys(value)) {
      if (!fields.includes(key)) error(`${path}.${key}`, 'unknown field');
    }
    return true;
  };
  const text = (value, path, max) => {
    if (typeof value !== 'string' || !value.trim() || value.length > max) {
      error(path, `must be nonempty text of at most ${max} characters`);
      return false;
    }
    return true;
  };
  const id = (value, path) => {
    if (!text(value, path, 64)) return false;
    if (!idPattern.test(value)) {
      error(path, 'must be a lowercase hyphen-separated identifier');
      return false;
    }
    return true;
  };
  const array = (value, path, min, max) => {
    if (!Array.isArray(value)) {
      error(path, 'must be an array');
      return false;
    }
    if (value.length < min || value.length > max) error(path, `must contain ${min}–${max} items`);
    return true;
  };
  const uniqueId = (value, path, seen) => {
    if (!id(value, path)) return;
    if (seen.has(value)) error(path, `duplicate ID "${value}"`);
    seen.add(value);
  };

  if (!Array.isArray(catalog)) return ['projects: must be an array'];
  const approvedRepos = new Set();
  for (const [index, project] of catalog.entries()) {
    if (!isRecord(project)) {
      error(`projects[${index}]`, 'must be a project object');
      continue;
    }
    if (!id(project.id, `projects[${index}].id`)) continue;
    if (approvedRepos.has(project.id)) error(`projects[${index}].id`, 'duplicate catalog ID');
    approvedRepos.add(project.id);
  }
  if (!isRecord(stories)) return [...errors, 'stories: must be a project-keyed object'];
  for (const projectId of approvedRepos) {
    if (!Object.hasOwn(stories, projectId)) error(projectId, 'missing story for catalog project');
  }

  function validateVisual(visual, path) {
    if (!isRecord(visual)) {
      error(path, 'must be a visual object');
      return;
    }
    switch (visual.type) {
      case 'contrast':
        object(visual, path, ['type', 'before', 'after']);
        text(visual.before, `${path}.before`, 140);
        text(visual.after, `${path}.after`, 140);
        break;
      case 'outcome':
        object(visual, path, ['type', 'result']);
        text(visual.result, `${path}.result`, 240);
        break;
      case 'image':
        object(visual, path, ['type', 'src', 'alt']);
        if (text(visual.src, `${path}.src`, 240) && !imagePattern.test(visual.src)) {
          error(`${path}.src`, 'must be a local image path under /images without traversal or query strings');
        }
        text(visual.alt, `${path}.alt`, 180);
        break;
      case 'roles':
      case 'steps': {
        object(visual, path, ['type', 'items']);
        if (!array(visual.items, `${path}.items`, 1, 3)) break;
        const roles = visual.type === 'roles';
        const nameField = roles ? 'name' : 'title';
        const detailField = roles ? 'role' : 'detail';
        visual.items.forEach((item, index) => {
          const itemPath = `${path}.items[${index}]`;
          if (!object(item, itemPath, [nameField, detailField])) return;
          text(item[nameField], `${itemPath}.${nameField}`, roles ? 48 : 64);
          text(item[detailField], `${itemPath}.${detailField}`, roles ? 120 : 160);
        });
        break;
      }
      case 'flow': {
        object(visual, path, ['type', 'nodes', 'edges']);
        const nodeIds = new Set();
        const validNodes = array(visual.nodes, `${path}.nodes`, 3, 5);
        if (validNodes) visual.nodes.forEach((node, index) => {
          const nodePath = `${path}.nodes[${index}]`;
          if (!object(node, nodePath, ['id', 'label', 'detail'])) return;
          uniqueId(node.id, `${nodePath}.id`, nodeIds);
          text(node.label, `${nodePath}.label`, 40);
          text(node.detail, `${nodePath}.detail`, 80);
        });
        const connected = new Set();
        const edgeIds = new Set();
        if (array(visual.edges, `${path}.edges`, 2, 10)) visual.edges.forEach((edge, index) => {
          const edgePath = `${path}.edges[${index}]`;
          if (!object(edge, edgePath, ['from', 'to'])) return;
          for (const endpoint of ['from', 'to']) {
            id(edge[endpoint], `${edgePath}.${endpoint}`);
            if (!nodeIds.has(edge[endpoint])) error(`${edgePath}.${endpoint}`, 'must reference an existing node');
            else connected.add(edge[endpoint]);
          }
          if (edge.from === edge.to) error(edgePath, 'self edges are not allowed');
          const key = JSON.stringify([edge.from, edge.to]);
          if (edgeIds.has(key)) error(edgePath, 'duplicate edge');
          edgeIds.add(key);
        });
        for (const nodeId of nodeIds) {
          if (!connected.has(nodeId)) error(path, `node "${nodeId}" has no edges`);
        }
        break;
      }
      default:
        error(`${path}.type`, 'must be contrast, image, flow, roles, steps, or outcome');
    }
  }

  for (const [key, story] of Object.entries(stories)) {
    if (!approvedRepos.has(key)) error(key, 'unmatched story: no approved catalog project');
    if (!object(story, key, ['projectId', 'sources', 'scenes'])) continue;
    if (story.projectId !== key) error(`${key}.projectId`, 'must match its catalog key');
    id(story.projectId, `${key}.projectId`);
    const sourceIds = new Set();
    if (array(story.sources, `${key}.sources`, 1, 8)) story.sources.forEach((source, index) => {
      const sourcePath = `${key}.sources[${index}]`;
      if (!object(source, sourcePath, ['id', 'title', 'url'])) return;
      uniqueId(source.id, `${sourcePath}.id`, sourceIds);
      text(source.title, `${sourcePath}.title`, 120);
      if (text(source.url, `${sourcePath}.url`, 2048) && !isSourceUrl(source.url, approvedRepos)) {
        error(`${sourcePath}.url`, 'must be a pinned 40-SHA GitHub blob in an approved repo or the canonical portfolio URL');
      }
    });
    if (!array(story.scenes, `${key}.scenes`, 6, 6)) continue;
    const sceneIds = new Set();
    let totalDuration = 0;
    story.scenes.forEach((scene, index) => {
      const path = `${key}.scenes[${index}]`;
      if (!object(scene, path, ['id', 'beat', 'headline', 'body', 'duration', 'visual', 'sources'])) return;
      uniqueId(scene.id, `${path}.id`, sceneIds);
      if (scene.beat !== beats[index]) error(`${path}.beat`, `expected "${beats[index] ?? 'no additional beat'}"`);
      text(scene.headline, `${path}.headline`, 80);
      text(scene.body, `${path}.body`, 400);
      if (typeof scene.duration !== 'number' || !Number.isFinite(scene.duration)
        || scene.duration < 3 || scene.duration > 20) {
        error(`${path}.duration`, 'must be a finite number from 3 to 20 seconds');
      } else totalDuration += scene.duration;
      if (array(scene.sources, `${path}.sources`, 1, 8)) {
        const used = new Set();
        scene.sources.forEach((sourceId, sourceIndex) => {
          const sourcePath = `${path}.sources[${sourceIndex}]`;
          uniqueId(sourceId, sourcePath, used);
          if (!sourceIds.has(sourceId)) error(sourcePath, 'must reference a declared source ID');
        });
      }
      validateVisual(scene.visual, `${path}.visual`);
      if (Object.hasOwn(beatVisuals, scene.beat)
        && !beatVisuals[scene.beat].includes(scene.visual?.type)) {
        error(`${path}.visual.type`, `${scene.beat} requires ${beatVisuals[scene.beat].join(' or ')}`);
      }
    });
    if (totalDuration < 45 || totalDuration > 60) error(`${key}.scenes`, 'total duration must be 45–60 seconds');
  }
  return errors;
}

const invokedPath = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href;
if (invokedPath === import.meta.url) {
  const errors = validateStories(projectStories, projects);
  const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
  for (const [projectId, story] of Object.entries(projectStories)) {
    if (!isRecord(story) || !Array.isArray(story.scenes)) continue;
    for (const scene of story.scenes) {
      if (scene?.visual?.type !== 'image' || !imagePattern.test(scene.visual.src)) continue;
      try {
        if (!statSync(resolve(publicRoot, scene.visual.src.slice(1))).isFile()) throw new Error('not a file');
      } catch {
        errors.push(`${projectId}.${scene.id}.visual.src: asset does not exist: ${scene.visual.src}`);
      }
    }
  }
  if (errors.length) {
    console.error(`Project story validation failed (${errors.length}):\n${errors.map(error => `- ${error}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    const count = Object.values(projectStories).reduce((sum, story) => sum + story.scenes.length, 0);
    console.log(`Project stories valid: ${projects.length} projects, ${count} scenes; image assets exist.`);
  }
}
