/*Copyright (c) 2013-2016, Rob Schmuecker
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/

///////////////////
//weid: modification.
var g_lrm="";
$(document).ready(function(){ 
  g_lrm=$("<a>&lrm;</a>").text();
});
function display_text(d){
  var eng=(d.english?d.english.substr(0):"");
  var heb=g_lrm+(d.hebrew?d.hebrew:"")+g_lrm;
  var s=""+d.name+" "+heb+" "+eng;
  if(d.children){
    eng=(d.english?d.english.substr(0,30):"");
    s=eng+" "+heb+" "+d.name;
  }
  return s;
}
function click_text(d){
    var sid=d.name;
    alert(sid);
}












    // Calculate total nodes, max label length
    var m_totalNodes = 0;
    var m_maxLabelLength = 0;
    // variables for drag/drop
    var m_selectedNode = null;
    var m_draggingNode = null;
    // panning variables
    var m_panSpeed = 200;
    var m_panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var m_duration = 750;
    var m_root;

    // size of the diagram
    var m_viewerWidth = 960;//$(document).width();
    var m_viewerHeight = 1024;//$(document).height();

    ///
    var m_treeLayout,
    m_diagonal,
    m_zoomListener,
    m_baseSvg,
    m_svgGroup
    ;


    function update(source) {
        // Compute the new height, function counts total children of m_root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);
                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, m_root);
        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
        m_treeLayout = m_treeLayout.size([newHeight, m_viewerWidth]);

        // Compute the new tree layout.
        var nodes = m_treeLayout.nodes(m_root).reverse(),
            links = m_treeLayout.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {//weid:link width.
            d.y = (d.depth * (m_maxLabelLength * 100)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = m_svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .call(dragListener)
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return "h"+d.name+":";//weid:not work
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
        .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {//weid:modified.
                return display_text(d);
            })
            //.on('click', click_text);

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(m_duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(m_duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = m_svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return m_diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(m_duration)
            .attr("d", m_diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(m_duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return m_diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }
    // sort the tree according to the node names

    function sortTree() {
        m_treeLayout.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        var speed = m_panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(m_svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = m_zoomListener.scale();
            m_svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            m_zoomListener.scale(m_zoomListener.scale());
            m_zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }
    // Define the zoom function for the zoomable tree

    function zoom() {
        m_svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    function initiateDrag(d, domNode) {
        m_draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');

        m_svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
            if (a.id != m_draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
            else return -1; // a is the hovered element, bring "a" to the front
        });
        // if nodes has children, remove the links and nodes
        if (nodes.length > 1) {
            // remove link paths
            links = m_treeLayout.links(nodes);
            nodePaths = m_svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = m_svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id;
                }).filter(function(d, i) {
                    if (d.id == m_draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        }

        // remove parent link
        parentLink = m_treeLayout.links(m_treeLayout.nodes(m_draggingNode.parent));
        m_svgGroup.selectAll('path.link').filter(function(d, i) {
            if (d.target.id == m_draggingNode.id) {
                return true;
            }
            return false;
        }).remove();

        dragStarted = null;
    }
    function endDrag() {
        m_selectedNode = null;
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
        if (m_draggingNode !== null) {
            update(m_root);
            centerNode(m_draggingNode);
            m_draggingNode = null;
        }
    }

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    var overCircle = function(d) {
        m_selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function(d) {
        m_selectedNode = null;
        updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function() {
        var data = [];
        if (m_draggingNode !== null && m_selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: m_selectedNode.y0,
                    y: m_selectedNode.x0
                },
                target: {
                    x: m_draggingNode.y0,
                    y: m_draggingNode.x0
                }
            }];
        }
        var link = m_svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = m_zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + m_viewerWidth / 2;
        y = y * scale + m_viewerHeight / 2;
        d3.select('g').transition()
            .duration(m_duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        m_zoomListener.scale(scale);
        m_zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.

    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
        d = toggleChildren(d);
        update(d);
        centerNode(d);
    }




function initLoad(treeData)
{
    m_viewerWidth  =  $(document).width();
    m_viewerHeight =  $(document).height();

    m_treeLayout = d3.layout.tree()
        .size([m_viewerHeight, m_viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    m_diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });


    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        m_totalNodes++;
        m_maxLabelLength = Math.max(d.name.length, m_maxLabelLength);

    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });



    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();


    // define the m_zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    m_zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    

    // define the baseSvg, attaching a class for styling and the m_zoomListener
    m_baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", m_viewerWidth)
        .attr("height", m_viewerHeight)
        .attr("class", "overlay")
        .call(m_zoomListener);


    // Define the drag listeners for drag/drop behaviour of nodes.
    dragListener = d3.behavior.drag()
        .on("dragstart", function(d) {
            if (d == m_root) {
                return;
            }
            dragStarted = true;
            nodes = m_treeLayout.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        .on("drag", function(d) {
            if (d == m_root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            // get coords of mouseEvent relative to svg container to allow for panning
            relCoords = d3.mouse($('svg').get(0));
            if (relCoords[0] < m_panBoundary) {
                panTimer = true;
                pan(this, 'left');
            } else if (relCoords[0] > ($('svg').width() - m_panBoundary)) {

                panTimer = true;
                pan(this, 'right');
            } else if (relCoords[1] < m_panBoundary) {
                panTimer = true;
                pan(this, 'up');
            } else if (relCoords[1] > ($('svg').height() - m_panBoundary)) {
                panTimer = true;
                pan(this, 'down');
            } else {
                try {
                    clearTimeout(panTimer);
                } catch (e) {

                }
            }

            d.x0 += d3.event.dy;
            d.y0 += d3.event.dx;
            var node = d3.select(this);
            node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
            updateTempConnector();
        }).on("dragend", function(d) {
            if (d == m_root) {
                return;
            }
            domNode = this;
            if (m_selectedNode) {
                // now remove the element from the parent, and insert it into the new elements children
                var index = m_draggingNode.parent.children.indexOf(m_draggingNode);
                if (index > -1) {
                    m_draggingNode.parent.children.splice(index, 1);
                }
                if (typeof m_selectedNode.children !== 'undefined' || typeof m_selectedNode._children !== 'undefined') {
                    if (typeof m_selectedNode.children !== 'undefined') {
                        m_selectedNode.children.push(m_draggingNode);
                    } else {
                        m_selectedNode._children.push(m_draggingNode);
                    }
                } else {
                    m_selectedNode.children = [];
                    m_selectedNode.children.push(m_draggingNode);
                }
                // Make sure that the node being added to is expanded so user can see added node is correctly moved
                expand(m_selectedNode);
                sortTree();
                endDrag();
            } else {
                endDrag();
            }
        });

    


    // Append a group which holds all nodes and which the zoom Listener can act upon.
    m_svgGroup = m_baseSvg.append("g");

    // Define the m_root
    m_root = treeData;
    m_root.x0 = m_viewerHeight / 2;
    m_root.y0 = 0;

    // Layout the tree initially and center on the m_root node.
    update(m_root);
    centerNode(m_root);
}

// Get JSON data
treeJSON = d3.json("flare.json", function(error, treeData) {
    initLoad(treeData);
});





