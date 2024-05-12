import graphology from 'https://cdn.jsdelivr.net/npm/graphology/+esm';
import Sigma from 'https://cdn.jsdelivr.net/npm/sigma/+esm';
import forceAtlas2 from 'https://cdn.jsdelivr.net/npm/graphology-layout-forceatlas2/+esm';

document.addEventListener('DOMContentLoaded', function() {
    main();
});

async function main(){
    try {
        const network_graph_json = await getNetworkGraphJson();
        let graph = createGraph(network_graph_json);
        graph = addLayout(graph);
        console.log("Graph data:", network_graph_json);
        console.log("Graph object:", graph);
        const sigmaInstance = new Sigma(graph, document.getElementById('container'));
        add_modal(sigmaInstance, graph);
    } catch (error) {
        console.error('Failed to load or create the graph:', error);
    }
}


function createGraph(network_graph_json){
    let graph = new graphology.Graph();

    for (const node of network_graph_json.nodes) {
        graph.addNode(
            node.key,
            {
                label: node.label,
                tag: node.tag,
                URL: node.URL,
                cluster: node.cluster,
                size: network_graph_json.tags.find((el) => el.key === node.tag).size,
                color: network_graph_json.tags.find((el) => el.key === node.tag).color,
            }
        );
    }

    for (const edge of network_graph_json.edges) {
        graph.addEdge(edge.source, edge.target);
    }

    return graph;
}

function addLayout(graph){

    graph.forEachNode((node) => {
        if (!graph.getNodeAttribute(node, 'x') && !graph.getNodeAttribute(node, 'y')) {
            graph.setNodeAttribute(node, 'x', Math.random());
            graph.setNodeAttribute(node, 'y', Math.random());
        }
    });

    forceAtlas2.assign(graph, {
        iterations: 100,
        settings: {
            gravity: 0.5,
            scalingRatio: 2.0
        }
    });

    return graph;
}

async function getNetworkGraphJson(){
    const response = await fetch('./assets/network_graph_json.json');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

function add_modal(sigmaInstance, graph){
    sigmaInstance.on('clickNode', ({node}) => {
        const attributes = graph.getNodeAttributes(node);
        const modal = document.getElementById('nodeModal');
        const modalText = document.getElementById('modalText');

        modalText.innerHTML = `Node Label: ${attributes.label}<br>Node Type: ${attributes.tag}<br>More info: <a href="${attributes.URL}">Click here</a>`;

        modal.style.display = "block";
    });

    const close = document.getElementsByClassName("close")[0];
    close.onclick = function() {
        const modal = document.getElementById('nodeModal');
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        const modal = document.getElementById('nodeModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
